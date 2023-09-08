import numpy as np

from .cluster_generator import ClusterGenerator
from .corpus import Corpus
from .document import Document
from .linguist import Linguist
from .mathematician import C_score
from .mathematician import cosine_similarity
from .mathematician import betweenness
from .mathematician import withinness
from .mathematician import get_composite
from .mathematician import check_convergence
from .rng import RNG

import random

class SoftKMeans(ClusterGenerator):
	def __init__(self, corpus: Corpus, linguist: Linguist, seed: int = 0):
		super().__init__(corpus, linguist) # I don't think we actually need corpus and linguist here
		self.k = 0
		self.k_max = None
		self.documents = []
		self.doc_vecs = []

		self.beta = 1.1
		self.exponent = np.divide(2, (self.beta - 1))
		self.threshold = 0.6

		self.clusters = []
		self.matrix = None
		self.best_matrix = None
		self.seed = seed # Should I use this here?
		self.rndgen = RNG(self.seed)


	def initialize_clusters_plus_plus(self):
		first = self.rndgen.choice(self.documents)
		centroids = [first]
		for i in range(self.k):
			Ds = []
			for doc in self.documents:
				Ds.append(min([1 - cosine_similarity(doc.vector, centroid.vector) for centroid in centroids]))
			Ds = np.array(Ds)
			Dsq = Ds**2
			pDs = (Dsq)/np.sum(Dsq)
			next_centroid = self.rndgen.randomSample(self.documents, p = pDs)
			centroids.append(next_centroid)
		centroids = [[c] for c in centroids]
		self.clusters = np.array(centroids, dtype = 'object')


	def initialize_clusters_random_pair(self, seeded_clusters: list[list[Document]]):
		self.clusters = seeded_clusters.copy()
		initial = self.rndgen.sample(range(0, len(self.documents)), (self.k-len(seeded_clusters))*2)
		for i in range(0, len(initial), 2):
			pair = self.documents[initial[i:i+2]]
			self.clusters.append(pair)
		self.clusters = np.array(self.clusters, dtype = 'object')

	def print_clusters(self):
		for i, cluster in enumerate(self.clusters):
			print("Cluster ", i, ": ")
			for doc in cluster:
				print(doc.text)
			print("\n")
		print("\n")


	def assign_soft_labels(self, d2s_extended):
		# Replace the matrix with the appropriate assignments for the seeded documents:
		seeded_matrix = self.matrix.copy()
		if d2s_extended.size != 0:
			seeded_matrix += d2s_extended # Zeros won't affect non-seeded, but seeded will become greater than one and thus will always match the threshold
		self.clusters = list(map(lambda i: self.documents[np.where(seeded_matrix[:, i] >= self.threshold)[0]], range(seeded_matrix.shape[1])))


	def get_label_list(self):
		if self.clusters:
			labels_list = []
			for doc in self.documents:
				labels = []
				for i, cluster in enumerate(self.clusters):
					if doc in cluster:
						labels.append(i)
				labels_list.append(labels)
			return labels_list
		else:
			print("We're in trouble!")
			return None


	def generate(self, documents: list[Document], k: int, frozen_document_clusters: list[list[Document]] = [], seeded_document_clusters: list[list[Document]] = [], frozen_documents: list[Document] = []):

		self.documents = np.array(documents, dtype = 'object')
		self.doc_vecs = np.array([d.vector for d in self.documents])
		self.k_max = min(int(np.floor(len(self.documents)/2)), k)

		if seeded_document_clusters:
			doc_to_seeded = np.zeros((len(self.documents), len(seeded_document_clusters)))
			for d_index, d in enumerate(self.documents):
				for s, sc in enumerate(seeded_document_clusters):
					if d in sc:
						doc_to_seeded[d_index, s] = 1
			sum = np.sum(doc_to_seeded, axis = 1)
			# Change any 0 to 1 so that division of zeros uses identity element.
			divisor = np.array([max(1, value) for value in sum])[:,None]
			doc_to_seeded= np.divide(doc_to_seeded, divisor)


		last_C_score = -10000
		best_model = None
		scores = []

		for i in range(2, self.k_max + 1): # Must be inclusive
			self.k = max(i, len(seeded_document_clusters)) # If the user has seeded more clusters than the k you're considering, then you can't reduce that number

			if seeded_document_clusters:
				d2s_extended = np.concatenate((doc_to_seeded, np.zeros((doc_to_seeded.shape[0], self.k - doc_to_seeded.shape[1]))), axis = 1)
			else:
				d2s_extended = np.array([])

			for j in range(0, 10):
				self.initialize_clusters_random_pair(seeded_document_clusters)
				self.run_soft_clustering(d2s_extended)
				self.assign_soft_labels(d2s_extended)
				score = C_score(list(self.documents) + frozen_documents, frozen_document_clusters + self.clusters) # Now append frozen clusters here -- don't need to worry about redundancy because frozen docs are not clustered in algo()
				if type(score) == np.float64: # C_score can return [nans]
					scores.append(score)
					if score > last_C_score:
						last_C_score = score
						best_model = self.clusters.copy()
						self.best_matrix = self.matrix

		self.clusters = best_model # Don't add frozen clusters because grid.py does that for you

		labels = self.get_label_list() # Could do this using matrix but then we'd have to keep the matrix
		if self.clusters:
			cluster_len = len(self.clusters)
		else:
			cluster_len = 0
		return labels, cluster_len # What should actually get returned here?

	def update_soft_centroids(self):
		centroids = []
		docs_T = self.doc_vecs.T
		for i in range(self.matrix.shape[1]):
			wk = self.matrix[:,i]
			centroid = np.divide(np.sum(np.multiply(wk, docs_T), axis = 1), np.sum(wk))
			centroids.append(centroid)
		return np.array(centroids)

	def calculate_coefficient(self, vector, centroids):
		norms = np.linalg.norm(np.subtract(vector, centroids + 0.0000000000001), axis = 1)
		b = np.sum(np.power(np.divide(1, norms), self.exponent))
		a = np.power(norms, self.exponent)
		return np.divide(1, (np.multiply(a,b)))

	def calculate_matrix(self, d2s_extended, centroids):
		# Without seeding: np.apply_along_axis(lambda x: self.calculate_coefficient(x, centroids), 1, self.doc_vecs)
		matrix = []
		for d_index, doc in enumerate(self.documents):
			if d2s_extended.size == 0 or np.sum(d2s_extended[d_index, :]) == 0:
				matrix.append(self.calculate_coefficient(self.doc_vecs[d_index], centroids))
			else:
				matrix.append(d2s_extended[d_index, :])
		self.matrix = np.array(matrix)


	def run_soft_clustering(self, d2s_extended):
		centroids = np.array([np.mean([d.vector for d in cluster], axis = 0) for cluster in self.clusters])
		last_centroids = []

		i, converged = 0, False
		while not converged:
			if len(last_centroids) > 0 and len(centroids) > 0:
				converged = check_convergence(centroids, last_centroids, i)
			self.calculate_matrix(d2s_extended, centroids)
			last_centroids = centroids
			centroids = self.update_soft_centroids()
			i += 1









