from cluster_generator import ClusterGenerator
from corpus import Corpus
from document import Document
from linguist import Linguist
import random


class Random(ClusterGenerator):
	def __init__(self, corpus: Corpus, linguist: Linguist, seed: int = 3):
		super().__init__(corpus, linguist)
		self.rndgen = random.Random(seed)
		self.seed = seed
		
	def generate(self,  documents: list[Document], k: int, frozen_document_lists: list[list[Document]] = [],
			seeded_document_lists: list[list[Document]] = [], all_frozen_docs: list[Document] = []) -> tuple[list[list[int]], int]:

		# random.seed(self.seed)
		if len(frozen_document_lists) > 0:
			k_selected = self.rndgen.sample(list(range(2,k)), 1)[0]
		else:
			k_selected = k

		modified_clusters = frozen_document_lists + seeded_document_lists

		all_seeded_documents = sum(seeded_document_lists, [])

		# Randomly assign documents in the documents list to one or more of k clusters, including seeded_document_lists. The documents list does not include docs that have been frozen.
		n = k_selected + len(seeded_document_lists)
		labels = []
		for doc in documents:
			if doc in all_seeded_documents:
				doc_labels = []
				for i, human_list in enumerate(seeded_document_lists):
					if doc in human_list:
						print(doc.readable, i)
						doc_labels.append(i)

			else:
				label1 = self.rndgen.randrange(n)
				doc_labels = [label1]

			if len(doc_labels) <= 1:
				label2 = self.rndgen.randrange(n*2)
				if label2 < n and label2 != label1:
					doc_labels.append(label2)

			labels.append(doc_labels)

		# Again the first N category digits will correspond to seeded_clusters (so if there are 2 seeded clusters, categories 0 and 1 will be those)
		return labels, n