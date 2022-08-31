from corpus import Corpus
from grid import Grid
from linguist import Linguist
from row import Row
import os.path

class Backend():
	def __init__(self, path: str):
		self.path = path

		# Get rows and Linguist set up
		self.rows = [Row('other'), Row('proportions'), Row('processes'), Row('decisions'), Row('conditions'), Row('causes'), Row('all')]
		self.linguist = Linguist()

		# These things stay here as items that are constant across many Grids
		self.tfidf_pmi_weight = 0.2
		self.corpus_filename = 'corpus.csv'

		# TODO: These should get thrown away once GloVe is set up in mathematician
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

		if not os.path.isfile(self.path + 'cleaned_docs.csv'):
			Corpus.clean_corpus(self.path, self.corpus_filename, 'cleaned_docs.csv', synonym_book, too_common) # TODO: remove synonym_book and too_common from linguist methods
		
		self.clean_corpus_filename = 'cleaned_docs.csv'


	# TODO: Right now filename is also the anchor. frontend needs to handle getting a filename from the GUI and passing it here.
	def get_grid(self, k: int, anchor: str, filename: str) -> Grid:
		print("New grid -- processing documents ... ")

		# Set row labels filename (TODO: throw error if it doesn't exist, because you can't generate it yet.)
		row_labels_filename = 'row_labels_' + filename + '.csv'
		print('Does the file with row labels exist? ', os.path.isfile(self.path + row_labels_filename))

		# Handling corpus and row label filenames as separate because corpus can span multiple grids and row label is a temporary file until we get a classifier going.
		# If the right files don't exist for this anchor, corpus will create them using filename.
		self.corpus = Corpus(self.path, self.clean_corpus_filename, row_labels_filename, filename, self.rows, anchor, self.linguist, self.tfidf_pmi_weight)
		grid = Grid.generate(self.path, self.corpus, k, self.synonym_book, self.too_common)
		return grid


	# TODO: Right now filename is also the anchor. frontend needs to handle getting a filename from the GUI and passing it here.
	def load_grid(self, anchor: str, filename: str) -> Grid:
		print("anchor", anchor)

		# Load a grid and return it.

		return Grid.generate(self.path, self.corpus, 4, self.synonym_book, self.too_common)
