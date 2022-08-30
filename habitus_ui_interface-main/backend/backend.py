from corpus import Corpus
from grid import Grid
from linguist import Linguist
from row import Row

class Backend():
	def __init__(self, path: str):
		self.path = path

		self.tfidf_pmi_weight = 0.2
		corpus_filename = 'corpus.csv'
		clean_filename = 'cleaned_docs.csv'
		anchor_filename = 'row_labels_horticulture.csv'
		anchor = 'horticulture'
		rows = [Row('other'), Row('proportions'), Row('processes'), Row('decisions'), Row('conditions'), Row('causes'), Row('all')]
		linguist = Linguist()
		self.synonym_book = [
			['harvester', 'thresher', 'machinery', 'equipment'],
			['planting', 'sowing', 'seeding'],
			['labor', 'migrant', 'manual'],
			['horticulture', 'onion', 'tomato', 'cold', 'garden', 'vegetable', 'potato'],
			['credit', 'repay', 'loan', 'reimburse', 'reimbursement', 'back'], # should have bigrams?
			['cooperative','coop', 'coops', 'cooperatives'],
			['extension', 'saed'],
			['bank', 'banque', 'agricole'],
			['research', 'isra'],
			['yield', 'production', 'ton', 'tons', 'kg', 'bags']
		]
		self.too_common = [['farmer', 'farmers'], ['rice'], ['dr', 'fall']]
		self.corpus = Corpus(self.path, anchor_filename, rows, anchor, linguist, self.tfidf_pmi_weight)

	def get_grid(self, k: int) -> Grid:
		print("New grid -- processing documents ... ")
		grid = Grid.generate(self.path, self.corpus, k, self.synonym_book, self.too_common)
		return grid

	def load_grid(self, anchor: str) -> Grid:
		print("anchor", anchor)
		return Grid.generate(self.path, self.corpus, 4, self.synonym_book, self.too_common)
