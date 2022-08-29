import numpy as np
import pandas as pd

from cluster import Cluster
from corpus import Corpus
from document import Document
from surdeanu2005 import Surdeanu2005

class Grid():
	def __init__(self, path: str, corpus, k: int, synonym_book, too_common, clusters: list[Cluster] = []):
		self.path = path
		self.k = k
		self.corpus = corpus
		self.synonym_book = synonym_book
		self.too_common = too_common
		self.clusters = clusters

		self.documents = corpus.documents
		self.anchor = corpus.anchor
		self.rows = corpus.rows
		self.tfidf_pmi_weight = corpus.tfidf_pmi_weight
		self.linguist = corpus.linguist
		self.trash = []

		self.cluster_generator = Surdeanu2005(self.corpus, self.linguist)

	@classmethod
	def generate(cls, path: str, corpus: Corpus, k: int, synonym_book, too_common):
		grid = cls(path, corpus, k, synonym_book, too_common)
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
		seeded_clusters = [cluster for cluster in self.clusters if cluster.is_seeded() and not cluster.is_frozen()]
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

	def name_cluster(self, documents: list[Document]) -> str:
		names = self.linguist.get_cluster_name(2, documents, self.corpus.tfidf, self.corpus.pmi, self.corpus.anchor,
				self.corpus.anchor_index, tfidf_pmi_weight = 0.1) # self.tfidf_pmi_weight)
		name = ' / '.join([c[1] for c in names])
		return name

	def generate_clusters(self):
		print("K: ", self.k)
		print("Generating grid ... ")
		frozen_clusters = [cluster for cluster in self.clusters if cluster.is_frozen()]
		seeded_clusters = [cluster for cluster in self.clusters if cluster.is_seeded() and not cluster.is_frozen()]

		# This returns cluster labels for each document. The first N category digits will correspond to the seeded_clusters.
		frozen_document_lists = [cluster.documents for cluster in frozen_clusters]
		seeded_document_lists = [cluster.human_documents for cluster in seeded_clusters]
		# TODO: The documents to be clustered should not include the frozen ones?
		documents = self.documents
		labels, num_clusters = self.cluster_generator.generate(documents, self.k, frozen_document_lists, seeded_document_lists)
		# The frozen ones will not be updated.
		self.update_seeded_clusters(documents, labels)

		new_machine_clusters = self.create_machine_clusters(documents, labels, num_clusters)
		# Replace any machine clusters that already exist, remove extraneous, add any extra.
		# For now, just remove old and put new on the end, but in the future, preserve order if possible.
		new_clusters = frozen_clusters + seeded_clusters + new_machine_clusters
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
		cluster_from = self.clusters[cluster_from_index]
		cluster_to = self.clusters[cluster_to_index]
		cluster_to.insert(document)
		cluster_from.remove(document)
		if not cluster_from:
			print(cluster_from.name, " will be removed.")
			self.clusters.pop(cluster_from_index)

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

	def create_human_cluster(self, frozen_else_seeded, concept):
		documents = self.linguist.find_relevant_docs(self.documents, concept)
		cluster = Cluster(concept, documents, human = True)
		if frozen_else_seeded:
			cluster.freeze()
		self.clusters.append(cluster)

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
