from corpus import Corpus
from grid import Grid
from linguist import Linguist
from row import Row
import os.path

class Backend():
	def __init__(self, path: str):
		self.path = path

		# These things stay here as items that are constant across many Grids
		self.tfidf_pmi_weight = 0.2
		self.corpus_filename = 'corpus.csv'

		# TODO: Check if cleaned_docs.csv exists; if not, create it using linguist --> need to move the clean method out of corpus and into linguist
		self.clean_corpus_filename = 'cleaned_docs.csv'

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


	def get_grid(self, k: int, anchor: str) -> Grid:
		print("New grid -- processing documents ... ")

		# Get rows and Linguist set up
		rows = [Row('other'), Row('proportions'), Row('processes'), Row('decisions'), Row('conditions'), Row('causes'), Row('all')] # TODO: Is this the best place to put these?
		linguist = Linguist()

		# Set row labels filename (TODO: throw error if it doesn't exist, because you can't generate it yet.)
		row_labels_filename = 'row_labels_' + anchor + '.csv'
		print('Does the file with row labels exist? ', os.path.isfile(self.path + row_labels_filename))

		# Create the sub-corpus with anchored text. Pass it the filename for the cleaned corpus. In future, you won't be passing
		#   it the row_labels_filename, because you'll be labeling rows on the fly with the classifier (unless you choose to do this 
		#   as part of the pre-computing, in which case you'll pass a file that the classifier generated.)
		self.corpus = Corpus(self.path, self.clean_corpus_filename, row_labels_filename, rows, anchor, linguist, self.tfidf_pmi_weight)
		grid = Grid.generate(self.path, self.corpus, k, self.synonym_book, self.too_common)
		return grid

	def load_grid(self, anchor: str) -> Grid:
		print("anchor", anchor)

		# Load a grid and return it.

		return Grid.generate(self.path, self.corpus, 4, self.synonym_book, self.too_common)
