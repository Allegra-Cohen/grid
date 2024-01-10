from .cluster_generator import ClusterGenerator
from .corpus import Corpus
from .document import Document
from .linguist import Linguist
# Gradually move optimized parts of the mathematician to this class.
# from .mathematician import C_score
from .mathematician import cosine_similarity
# from .mathematician import betweenness
# from .mathematician import withinness
# from .mathematician import get_composite
from .rng import RNG
from typing import List, Tuple

import numpy as np

# See also https://en.wikipedia.org/wiki/Fuzzy_clustering
class SoftKMeans2(ClusterGenerator):
	def __init__(self, corpus: Corpus, linguist: Linguist, seed: int = 0):
		super().__init__(corpus, linguist) # I don't think we actually need corpus and linguist here
		self.beta = 1.1 # This is called m in the wikipedia article.
		self.exponent = np.divide(2, (self.beta - 1)) # scalar
		self.threshold = 0.6
		self.loop_count = 10
		self.update_count = 100
		self.update_limit = 0.00001
		self.perturbance = 0.0000000000001
		self.rndgen = RNG(seed)

	# Generate k more clusters by choosing randomly from the documents.  This means that some
	# documents which may already have been used in seeded clusters can be reused.
	def _generate_clusters_random_pair(self, k, documents):
		sample = self.rndgen.sample(documents, k * 2)
		paired_sample = [sample[i:i + 2] for i in range(0, len(sample), 2)]
		return paired_sample
	
	def _assign_soft_labels(self, np_doc_to_seeded_k, np_matrix, np_documents):
		# These are added in place, giving a boost to the documents in the seeded clusters.
		# Zeros won't affect non-seeded, but seeded will become greater than one and thus will always match the threshold.
		# If documents were split between several clusters, they might not make the threshold, though.
		seeded_matrix = np_matrix + np_doc_to_seeded_k # This creates a new matrix, because out is not specified.
		# Alternatively, just remember where they were seeded and keep them there.
		clusters = list(map(lambda i: np_documents[np.where(seeded_matrix[:, i] >= self.threshold)[0]], range(seeded_matrix.shape[1])))
		return clusters

	# For each document, what are the indices of the clusters it belongs to?
	def _get_label_list(self, clusters, documents) -> List[List[int]]:
		labels = [
			[cluster_index for cluster_index, cluster in enumerate(clusters) if document in cluster]
			for document in documents
		]
		return labels

	def get_composite(self, cluster):
		if len(cluster) > 0:
			vecs = []
			for d in cluster:
				vecs.append(d.vector)
			return np.mean(vecs, axis = 0)
		else:
			return None
	
	def C_score(self, docs, clusters, meta_centroid):
		centroids = [self.get_composite(cluster) for cluster in clusters]

		def b_and_w():
			betweenness_sum = 0.0
			withinness_sum = 0.0
			for index in range(len(clusters)):
				cluster = clusters[index]
				cluster_len = len(cluster)
				if cluster_len > 0:
					centroid = centroids[index]
					betweenness_dist = (1 - cosine_similarity(centroid, meta_centroid))
					betweenness_sum += cluster_len * (betweenness_dist**2)
					for document in cluster:
						withinness_dist = (1 - cosine_similarity(document.vector, centroid))
						withinness_sum += withinness_dist**2
			return betweenness_sum, withinness_sum

		n, k = len(docs), len(clusters)
		b, w = b_and_w()

		if k > 1 and w != 0.0:
			return (b * (n - k)) / (w * (k - 1))
		else:
			return np.nan # Don't want a single cluster



	# For a particular k, generate the cluster and score.  In the process, seed with random pairs in 10 different ways.
	def _generate(self, k, k_seeded, documents, np_documents, np_doc_to_seeded, frozen_document_clusters, np_doc_vecs, document_seed_counts, seeded_clusters, all_documents, meta_centroid) -> Tuple[List[List[int]], float]:
		# Pad doc_to_seeded to account for k clusters.  Everything added will be zero, because the seeded documents
		# will not belong at all to the generated clusters even if they are in the cluster.
		np_doc_to_seeded_k = np.concatenate((np_doc_to_seeded, np.zeros((len(np_documents), k - k_seeded))), axis = 1)

		def loop() -> Tuple[List[List[int]], float]:
			generated_clusters = self._generate_clusters_random_pair(k - k_seeded, documents)
			seeded_and_generated_clusters = seeded_clusters + generated_clusters
			# There should now be k clusters, in the np_doc_to_seeded we only have membership of the seeded ones
			# Nothing is keeping track of the generated ones.  OK, because they will not belong 100% to those anyway.
			np_matrix = self._run_soft_clustering(np_doc_to_seeded_k, seeded_and_generated_clusters, np_doc_vecs, document_seed_counts)
			clusters = self._assign_soft_labels(np_doc_to_seeded_k, np_matrix, np_documents)
			# Now append frozen clusters here -- don't need to worry about redundancy because frozen docs are not clustered in algo()
			# We just need all documents here.
			all_clusters = frozen_document_clusters + clusters
			score = self.C_score(all_documents, all_clusters, meta_centroid)
			return clusters, score, np_matrix

		# The matrix has been added to the tuple.
		clusters_score_tuples = [loop() for x in range(self.loop_count)]
		valid_clusters_score_tuples = [clusters_score_tuple for clusters_score_tuple in clusters_score_tuples if type(clusters_score_tuple[1]) == np.float64]
		
		if len(valid_clusters_score_tuples) == 0:
			return None
		else:
			scores = [clusters_score_tuple[1] for clusters_score_tuple in valid_clusters_score_tuples]
			best_index = scores.index(max(scores))
			return valid_clusters_score_tuples[best_index]

	# This sets up a matrix with a row for each document and a column for each seeded cluster.
	# The values in the matrix tell to what extent the document belongs to that cluster.
	def _seed_clusters(self, seeded_clusters, np_documents, document_seed_counts):
		np_doc_to_seeded = np.zeros((len(np_documents), len(seeded_clusters)), dtype=np.float64)
		for document_index, document in enumerate(np_documents):
			count = document_seed_counts[document_index]
			if count != 0:
				seed = 1.0 / count
				for seeded_cluster_index, seeded_cluster in enumerate(seeded_clusters):
					if document in seeded_cluster:
						np_doc_to_seeded[document_index, seeded_cluster_index] = seed
		return np_doc_to_seeded

	# Get the range of feasible k values, even if the suggested k is not in it.
	def _get_k_range(self, k, document_count: int, seeded_cluster_count: int) -> range:
		# The algorithm does not necessarily work on fewer than 4 documents.
		# With 0 documents and none seeded, k_min = 2, k_max = 0.
		# With 1 document  and none seeded, k_min = 2, k_max = 0.
		# With 2 documents and none seeded, k_min = 2, k_max = 1.
		# With 3 documents and none seeded, k_min = 2, k_max = 1.
		# With 4 documents and none seeded, k_min = 2, k_max = 2.
		assert 1 <= document_count
		# We want at least two clusters, but also can't go less than the seeded cluster count.
		k_min = max(2, seeded_cluster_count)
		# We want to have at least two documents in every cluster, so don't allow more than half the document count.
		# Here it is apparent that k is the maximum desired k, not necessarily the actual k to use.
		k_max = min(int(np.floor(document_count / 2)), k)
		# If there are lots of seeded document clusters, but they are seeded with just a single document,
		# then it can look like there is no suitable k value.  In that case, go with the number seeded.
		# For example, there are 5 seeded clusters, each with a single document, and there are 8 documents overall.
		# k_min = 5, k_max = min(4, k), so there is no work to do.  Go with 5, the seeded cluster count.
		if k_min <= k_max:
			return range(k_min, k_max + 1) # The right endpoint should be inclusive.
		else:
			assert 1 <= seeded_cluster_count # There must be some clusters.
			return range(seeded_cluster_count, seeded_cluster_count + 1)

	# Documents here do not include the frozen ones which are in the frozen_document_clusters.

	def generate(self, documents: List[Document], k: int, frozen_clusters: List[List[Document]] = [], seeded_clusters: List[List[Document]] = [], frozen_documents: list[Document] = []) -> Tuple[List[List[int]], int]:
		k_seeded = len(seeded_clusters)
		k_range = self._get_k_range(k, len(documents), k_seeded)
		# For whatever documents are going to be run, find the major centroid thing once and for all.
		# Just put the document index here instead of the entire document?  Is python match by value or by reference?
		# A document can be used for seeding a cluster or generating a cluster or nothing.
		np_documents = np.array(documents, dtype = 'object') # Could these just be the strings?
		np_doc_vecs = np.array([d.vector for d in np_documents])
		all_documents = frozen_documents + documents
		meta_centroid = self.get_composite(all_documents)
		# For each document, count how many times it is in a seeded_cluster.
		document_seed_counts = [
			sum([1 for seeded_cluster in seeded_clusters if document in seeded_cluster])
			for document in documents
		]
		doc_to_seeded = self._seed_clusters(seeded_clusters, np_documents, document_seed_counts)
		clusters_score_tuples = [
			self._generate(k, k_seeded, documents, np_documents, doc_to_seeded, frozen_clusters, np_doc_vecs, document_seed_counts, seeded_clusters, all_documents, meta_centroid)
			for k in k_range
		]
		valid_clusters_score_tuples = [clusters_score_tuple for clusters_score_tuple in clusters_score_tuples if clusters_score_tuple]
		if valid_clusters_score_tuples:
			scores = [model_score_tuple[1] for model_score_tuple in valid_clusters_score_tuples]
			best_index = scores.index(max(scores))
			best_clusters = valid_clusters_score_tuples[best_index][0]
			labels = self._get_label_list(best_clusters, np_documents)
			self.best_matrix = valid_clusters_score_tuples[best_index][2]
			return labels, len(best_clusters), self.best_matrix
		else:
			print("What now?")
			return None, 0, None

	def _update_soft_centroids(self, np_doc_vecs, np_matrix):
		np_doc_vecs_T = np_doc_vecs.T # T is for transpose!

		def calculate_centroid(cluster_index):
			wk = np_matrix[:, cluster_index]
			product = np.multiply(wk, np_doc_vecs_T)
			sum = np.sum(product, axis = 1)
			wksum = np.sum(wk)
			centroid = np.divide(sum, wksum)
			return centroid

		centroids = [calculate_centroid(cluster_index) for cluster_index in range(np_matrix.shape[1])]
		return np.array(centroids)

	def _calculate_coefficient(self, vector, centroids):
		sums = centroids + self.perturbance
		diffs = np.subtract(vector, sums)
		norms = np.linalg.norm(diffs, axis = 1)
		divs = np.divide(1, norms)
		pows = np.power(divs, self.exponent)
		b = np.sum(pows)
		a = np.power(norms, self.exponent)
		return np.divide(1, (np.multiply(a, b)))

	def _calculate_matrix(self, np_doc_to_seeded_k, np_centroids, np_doc_vecs, document_seed_counts):
		# Without seeding: np.apply_along_axis(lambda x: self._calculate_coefficient(x, centroids), 1, doc_vecs)

		def get_coefficients(document_index, doc_vec):
			if document_seed_counts[document_index] == 0:
				# This document is not seeded, so coefficients need to be calculated.
				return self._calculate_coefficient(doc_vec, np_centroids)
			else:
				# The document is seeded, so use values from the seeding.
				return np_doc_to_seeded_k[document_index, :]

		matrix = [get_coefficients(document_index, doc_vec) for document_index, doc_vec in enumerate(np_doc_vecs)]
		return np.array(matrix)

	def check_convergence(self, centroids, last_centroids, j):
		diffs = []
		for i, centroid in enumerate(centroids):
			# TODO The mean might be negative and thereby pass the updateLimit test.
			diffs.append(np.mean(centroid - last_centroids[i]))
		if max(diffs) < self.update_limit or j > self.update_count:
			return True
		else:
			return False

	def _run_soft_clustering(self, np_doc_to_seeded_k, seeded_and_generated_clusters, np_doc_vecs, document_seed_counts):
		# This is just the initial value for the clusters.  It will be updated.
		np_centroids = np.array([np.mean([d.vector for d in cluster], axis = 0) for cluster in seeded_and_generated_clusters])

		count, converged = 0, False
		while True:
			np_matrix = self._calculate_matrix(np_doc_to_seeded_k, np_centroids, np_doc_vecs, document_seed_counts)
			if converged:
				# If it converged the last time around, return the updated matrix.
				return np_matrix
			last_np_centroids = np_centroids
			np_centroids = self._update_soft_centroids(np_doc_vecs, np_matrix)
			count += 1
			converged = self.check_convergence(np_centroids, last_np_centroids, count)
