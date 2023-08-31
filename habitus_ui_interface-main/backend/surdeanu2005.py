from .cluster_generator import ClusterGenerator
from .corpus import Corpus
from .document import Document
from .linguist import Linguist
from .mathematician import generate_clusters
from .mathematician import get_best_initial_model
from .mathematician import get_best_initial_model_k
from .mathematician import quality_scores
from .mathematician import run_expect_max
from .rng import RNG

class Surdeanu2005(ClusterGenerator):
	def __init__(self, corpus: Corpus, linguist: Linguist, seed: int = 0):
		super().__init__(corpus, linguist)
		self.quality_names = ['w', 'wb', 'wn', 'gw', 'gwb', 'gwn']
		self.allowed_seed_size = 0.05
		self.soft = 0.2
		self.num_loops = 10
		self.rndgen = RNG(seed)

	def generate_clusters(self, documents: list[Document]) -> list[tuple[float, list[Document]]]:
		clusters, siblings = generate_clusters(documents, self.corpus.doc_distances)
		sorted_qualities = quality_scores(clusters, siblings, documents, self.corpus.doc_distances)
		return sorted_qualities

	def generate(self, documents: list[Document], k: int, frozen_document_lists: list[list[Document]] = [],
			seeded_document_lists: list[list[Document]] = [], frozen_documents: list[Document] = []) -> tuple[list[list[int]], int]:
		sorted_qualities = self.generate_clusters(documents) # This seems to be cluster_count x document_count
		modified_clusters = frozen_document_lists + seeded_document_lists

		if k is None:
			_, _, categories = get_best_initial_model(documents, sorted_qualities, self.quality_names, modified_clusters = modified_clusters)
		else:
			# k -= len(modified_clusters) # Always keep the right number
			_, _, categories = get_best_initial_model_k(k, documents, self.corpus.doc_distances, sorted_qualities, self.quality_names, allowed_seed_size = self.allowed_seed_size, modified_clusters = modified_clusters)
		# Frozen and seeded clusters are going to be the first N here in this list.
	  # ... Remove frozen clusters because they shouldn't be added to.
		categories: list[list[Document]] = categories[len(frozen_document_lists):]


		labels = run_expect_max(documents, seeded_document_lists, categories, self.corpus.words, self.corpus.word_indices, self.corpus.words_in_docs, self.linguist.word_vectorizer,
				self.corpus.counts, self.rndgen, soft = self.soft, num_loops = self.num_loops) # Soft needs to be gap situation

		# Again the first N category digits will correspond to seeded_clusters (so if there are 2 seeded clusters, categories 0 and 1 will be those)
		return labels, len(categories)
