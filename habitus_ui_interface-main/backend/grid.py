import numpy as np
import pandas as pd

from .cluster import Cluster
from .corpus import Corpus
from .document import Document
from .soft_kmeans import SoftKMeans
from .surdeanu2005 import Surdeanu2005

class Grid():
	def __init__(self, path: str, supercorpus_filename: str, row_filename: str, unique_filename: str, corpus, k: int, clustering_algorithm, clusters: list[Cluster] = []):
		self.path = path
		self.k = k
		self.corpus = corpus
		self.clusters = clusters
		self.unassigned = []

		self.supercorpus_filename = supercorpus_filename
		self.row_filename = row_filename
		self.unique_filename = unique_filename

		self.documents = self.corpus.documents
		self.anchor = self.corpus.anchor
		self.rows = self.corpus.rows
		self.linguist = self.corpus.linguist
		self.trash = []

		if clustering_algorithm == 'surdeanu':
			self.cluster_generator = Surdeanu2005(self.corpus, self.linguist)
		else:
			self.cluster_generator = SoftKMeans(self.corpus, self.linguist)

	@classmethod
	def generate(cls, path: str, supercorpus_filename: str,  row_filename: str, grid_filename: str, corpus: Corpus, k: int, clustering_algorithm: str):
		grid = cls(path, supercorpus_filename, row_filename, grid_filename, corpus, k, clustering_algorithm)
		print("\n\n\nInitializing a Grid for anchor: ", grid.anchor)
		grid.generate_clusters()
		return grid

	# Say whether there are any clusters.
	def __bool__(self) -> bool:
		return not not self.clusters

	def set_k(self, k: int):
		self.k = k

	def regenerate(self):
		self.generate_clusters()


	def create_machine_clusters(self, documents, labels, num_clusters):
		# Skip the seeded clusters in the labels.
		seeded_clusters = [cluster for cluster in self.clusters if cluster.is_seeded()]
		machine_clusters = []
		for cluster_index in range(len(seeded_clusters), num_clusters): # Look at every label that isn't a seeded_cluster label
			if type(labels[0]) == list:
				cluster_documents = [documents[document_index] for document_index, label_list in enumerate(labels) if cluster_index in label_list]
			else:
				label_array = np.array(labels)
				cluster_documents = list(label_array[label_array == cluster_index])
			if cluster_documents:
				name = self.name_cluster(cluster_documents)
				machine_clusters.append(Cluster(name, cluster_documents))
		return machine_clusters

	def update_seeded_clusters(self, documents, labels):
		# Before clustering was performed, the seeded_clusters were moved towards zero
		# so that the labels will refer to them there.
		# TODO: rearrange this so that loop through labels and send them to the right clusters.
		seeded_clusters = [cluster for cluster in self.clusters if cluster.is_seeded()]
		for cluster_index, cluster in enumerate(seeded_clusters):
			cluster_documents = []
			for document_index, label in enumerate(labels):
				if type(label) == list:
					if cluster_index in label:
						cluster_documents.append(documents[document_index])
				else:
					if label == cluster_index:
						cluster_documents.append(documents[document_index])
			cluster.set_documents(cluster_documents)
			name = self.name_cluster(cluster_documents)
			cluster.set_name(name, False)
		self.clusters = [cluster for cluster in self.clusters if cluster] # Some seeded clusters may have disappeared if they were made up only of documents that are now part of frozen clusters
		

	def name_cluster(self, documents: list[Document]) -> str:
		names = self.linguist.get_cluster_name(2, documents, self.corpus.tfidf, self.corpus.anchor)
		name = ' | '.join([c[1] for c in names])
		if name == 'nan' or name == np.nan or name == '':
			return 'No name'
		else:
			return name

	def flatten_lists(self, lists):
		biglist = []
		for sublist in lists:
			biglist += sublist
		return biglist


	def get_unlabeled_docs(self, documents, labels):
		unlabeled = []
		for document_index, label in enumerate(labels):
			if not label:
				unlabeled.append(documents[document_index])
		return unlabeled


	def generate_clusters(self):
		print("K: ", self.k)
		print("Generating grid ... ")
		frozen_clusters = [cluster for cluster in self.clusters if cluster.is_frozen()]
		seeded_clusters = [cluster for cluster in self.clusters if cluster.is_seeded()]

		# This returns cluster labels for each document. The first N category digits will correspond to the seeded_clusters.
		frozen_document_lists = [cluster.documents for cluster in frozen_clusters]
		seeded_document_lists = [cluster.human_documents for cluster in seeded_clusters]

		# If a document has been put into a frozen cluster, you shouldn't be clustering it any other place.
		# Note: This scraps seeded clusters that haven't been frozen. The alternative is to keep seeded documents
		#       in their clusters, but not in any other clusters, which gets really complicated in mathematician.
		all_frozen_docs = self.flatten_lists(frozen_document_lists)
		documents = [doc for doc in self.documents if doc not in all_frozen_docs] # Don't cluster stuff that doesn't have vector embeddings, also don't bother with stuff that doesn't have row labels
		if len(documents) > 0:
			labels, num_clusters = self.cluster_generator.generate(documents, self.k, frozen_document_lists, seeded_document_lists, all_frozen_docs)

			self.unassigned = self.get_unlabeled_docs(documents, labels)

			# The frozen ones will not be updated.
			self.update_seeded_clusters(documents, labels)
			seeded_clusters = [cluster for cluster in self.clusters if cluster.is_seeded()] # Need to recalculate this list because you may have lost a seeded cluster or two if they were composed of only documents frozen elsewhere

			new_machine_clusters = self.create_machine_clusters(documents, labels, num_clusters)
			# Replace any machine clusters that already exist, remove extraneous, add any extra.
			# For now, just remove old and put new on the end, but in the future, preserve order if possible.
			new_clusters = frozen_clusters + seeded_clusters + new_machine_clusters + [Cluster('Unassigned', self.unassigned, False)]
			self.clusters = new_clusters

	def export_for_evaluation(self, filename):
		document_list = [document.readable for document in self.corpus.get_documents()]
		cluster_list = []
		for document in self.corpus.get_documents():
			labels = [index for index, cluster in enumerate(self.clusters) if cluster.has_document(document)]
			cluster_list.append(labels)
		pd.DataFrame({'docs': document_list, 'cluster': cluster_list}).to_csv(filename)

	def copy_document(self, document, cluster_from_index, cluster_to_index):
		cluster_from = self.clusters[cluster_from_index]
		cluster_to = self.clusters[cluster_to_index]
		cluster_to.insert(document)

	def copy_document_by_index(self, doc_num, cluster_from_index, cluster_to_index):
		document = self.clusters[cluster_from_index].documents[doc_num]
		self.copy_document(document, cluster_from_index, cluster_to_index)
	
	def move_document(self, document, cluster_from_index, cluster_to_index):
		if cluster_from_index != cluster_to_index:
			cluster_from = self.clusters[cluster_from_index]
			cluster_to = self.clusters[cluster_to_index]
			if cluster_to.name != 'Unassigned':
				cluster_to.insert(document)
				cluster_from.remove(document)
				if not cluster_from:
					print(cluster_from.name, " will be removed.")
					self.clusters.pop(cluster_from_index)
				if not cluster_to.frozen:
					name = self.name_cluster(cluster_to.documents)
					cluster_to.set_name(name, cluster_to.frozen)

	def move_document_by_index(self, doc_num, cluster_from_index, cluster_to_index):
		document = self.clusters[cluster_from_index].documents[doc_num]
		self.move_document(document, cluster_from_index, cluster_to_index)

	def delete_document(self, document: Document):
		for cluster in self.clusters:
			cluster.remove(document)
			if not cluster:
				print(cluster.name, " will be removed.")
		self.clusters = [cluster for cluster in self.clusters if cluster]
		self.trash.append(document)
		self.documents.remove(document)

	def delete_document_by_index(self, doc_num, cluster_index):
		document = self.clusters[cluster_index].documents[doc_num]
		self.delete_document(document)

	def freeze_document(self, doc_num, cluster_index):
		cluster = self.clusters[cluster_index]
		document = cluster.documents[doc_num]
		cluster.insert(document)

	def create_human_cluster(self, concept):
		documents = self.linguist.find_relevant_docs(self.documents, concept)
		if len(documents) > 0:
			cluster = Cluster(concept, documents, frozen = True)
			self.clusters.append(cluster)
		return documents

	def delete_cluster(self, cluster_index):
		self.unassigned += self.clusters[cluster_index].documents
		self.clusters.pop(cluster_index)

	def freeze_cluster(self, cluster_index):
		self.clusters[cluster_index].freeze()

	def get_clicked_documents(self, column_index, row_index) -> list[Document]:
		if column_index == None or row_index == None or \
				column_index not in range(len(self.clusters)) or \
				row_index not in range(len(self.rows)):
			return []
		else:
			clicked_cluster = self.clusters[column_index]
			return [document for document in clicked_cluster.documents if document.is_member(row_index)]


	def dump(self, write = True):

		def dump_documents():
			records = []
			for document in self.documents:
				map = {row.name: document.is_member(row_index) for row_index, row in enumerate(self.rows)}
				record = {
					'readable': document.readable,
					'stripped': document.stripped,
					'map': map
				}
				records.append(record)
			data = {
				'readable': [record['readable'] for record in records],
				'stripped': [record['stripped'] for record in records]
			}
			for row in self.rows:
				data[row.name] = [record['map'][row.name] for record in records]
			pd.DataFrame(data).to_csv(self.path + self.unique_filename + '_documents.csv')

		def dump_specs(): # This is stupid right now, but we might have complicated anchors in the future (e.g., '(tomatoes OR onions) AND seed')
			pd.DataFrame({'anchor':[self.anchor], 'row_filename':[self.row_filename], 'corpus':[self.supercorpus_filename], 'filename':[self.unique_filename]}).to_csv(self.path + self.unique_filename + '_specs.csv')

		def dump_tokens():
			tokens = []
			for document_index, document in enumerate(self.documents):
				tokens.append(document.tokens)
			pd.DataFrame({'tokens': tokens}).to_csv(self.path + self.unique_filename + '_tokens.csv')

		def dump_vectors():
			vectors = []
			for document_index, document in enumerate(self.documents):
				vectors.append(document.vector)
			pd.DataFrame({'vectors': vectors}).to_csv(self.path + self.unique_filename + '_vectors.csv')

		def dump_cells():
			records = []
			for row_index, row in enumerate(self.rows):
				for col_index, cluster in enumerate(self.clusters):
					for document in self.get_clicked_documents(col_index, row_index):
						record = {
							'row': row.name,
							'col': cluster.name,
							'frozen_col': cluster.frozen,
							'readable': document.readable,
							'seeded_doc': document in cluster.human_documents
						}
						records.append(record)
			data = {
				'row': [record['row'] for record in records],
				'col': [record['col'] for record in records],
				'frozen_col': [record['frozen_col'] for record in records],
				'readable': [record['readable'] for record in records],
				'seeded_doc': [record['seeded_doc'] for record in records]
			}
			if write:
				pd.DataFrame(data).to_csv(self.path + self.unique_filename + '_cells.csv')
			else:
				return pd.DataFrame(data)
		if write:
			dump_specs()
			dump_documents()
			dump_tokens()
			dump_vectors()
		return dump_cells()










