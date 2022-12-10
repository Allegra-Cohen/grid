from corpus import Corpus
from grid import Grid
from cluster import Cluster
from linguist import Linguist
from row import Row
import os.path
import pandas as pd

class Backend():
	def __init__(self, path: str):
		self.path = path
		self.supercorpus_filename = None
		self.clean_supercorpus_filename = None

		self.row_labels_filename = "row_labels_harvest.csv" # ahhhhhh
		# These things stay here as items that are constant across many Grids
		self.tfidf_pmi_weight = 0.2

		# Use the synonym book only for local synonyms, e.g., entity acronyms or non-English words, or abbreviations. Note: ask user to provide these?
		self.synonym_book = [
			['cooperative', 'coop'],
			['extension', 'saed'],
			['bank', 'banque', 'agricole'], # For example, there's no way the embeddings would know that "bank" and "Banque Agricole" are the same word.
			['research', 'isra']
		]

		# TODO: This should be a boolean anchor provided by the user. For now, we cheat.
		self.anchor_book = {
			'harvest': ['harvester', 'thresher', 'equipment', 'machinery'],
			'horticulture': ['tomato', 'tomatoes', 'onions', 'onion', 'potatoes', 'corn', 'peppers', 'vegetable', 'garden'],
			'credit': ['loan', 'repay']
		}


	def set_supercorpus(self, filename):
		if os.path.isfile(self.path + filename):
			self.supercorpus_filename = filename
			self.clean_supercorpus_filename = 'cleaned_' + filename
			if not os.path.isfile(self.path + self.clean_supercorpus_filename):
				Corpus.clean_corpus(self.path, self.supercorpus_filename, self.clean_supercorpus_filename, self.synonym_book)
			return True
		else:
			return False


	# TODO: Right now filename is also the anchor. frontend needs to handle getting a filename from the GUI and passing it here.
	#       Suggest that filename should be provided when the user creates the Grid (a process which isn't supported yet.)
	def get_grid(self, k: int, anchor: str, grid_filename: str, clustering_algorithm: str) -> Grid:
		print("New grid -- processing documents ... ")
		print(anchor)
		self.set_up_corpus(grid_filename, anchor)
		grid = Grid.generate(self.path, grid_filename, self.corpus, k, self.synonym_book, clustering_algorithm)
		return grid


	def load_grid(self, filename: str, clustering_algorithm: str) -> Grid:
		print("Loading grid from root filename ", filename)
		try:
			anchor = list(pd.read_csv(self.path + filename + '_anchor.csv')['anchor'])[0]
			anchor = anchor.split('_')[0].strip()
			self.set_up_corpus(anchor, anchor)

			cells = pd.read_csv(self.path + filename + '_cells.csv')
			col_names = pd.unique(cells['col'])
			clusters = self.load_clusters(cells, col_names)
			k = len(col_names)
			grid = Grid(self.path, filename, self.corpus, k, self.synonym_book, clustering_algorithm, clusters)
		except FileNotFoundError:
			print("That grid doesn't exist. Try creating it and saving it.")
			grid = None

		return grid


	def set_up_corpus(self, grid_filename: str, anchor: str):
		# Get rows and Linguist set up
		self.rows = [Row('other'), Row('proportions'), Row('processes'), Row('decisions'), Row('conditions'), Row('causes'), Row('all')]
		# self.rows = [Row('other'), Row('proportion'), Row('parameter'), Row('sequence'), Row('function'), Row('switch'), Row('condition'), Row('all')]
		self.linguist = Linguist()

		print('Does the file with row labels exist? ', os.path.isfile(self.path + self.row_labels_filename))

		# Handling corpus and row label filenames as separate because corpus can span multiple grids and row label is a temporary file until we get a classifier going.
		# If the right files don't exist for this anchor, corpus will create them using filename.
		self.corpus = Corpus(self.path, self.clean_supercorpus_filename, self.row_labels_filename, grid_filename, self.rows, anchor, self.anchor_book, self.linguist, self.tfidf_pmi_weight)

	# Not sure if this should be in backend, or a method of Grid
	def load_clusters(self, cells, col_names: list[str]):
		frozen_clusters, seeded_clusters, machine_clusters = [], [], []

		for name in col_names:
			cell_docs = pd.unique(list(cells.loc[cells['col'] == name, 'readable']))
			seeded_docs = pd.unique(list(cells.loc[(cells['seeded_doc']) & (cells['col'] == name), 'readable']))

			documents, seeded_documents = [], []
			for doc_object in self.corpus.documents:
				if doc_object.readable in cell_docs:
					documents.append(doc_object)
				if doc_object.readable in seeded_docs:
					seeded_documents.append(doc_object)

			if True in list(cells.loc[cells['col'] == name, 'frozen_col']): # If the col is frozen, all docs go in the human_document list
				cluster = Cluster(name, documents, True)
				frozen_clusters.append(cluster)
			else: # Might not be frozen, but could still be seeded
				cluster = Cluster(name, documents, False)
				if seeded_documents:
					cluster.human_documents = seeded_documents

					seeded_clusters.append(cluster)
				else:

					machine_clusters.append(cluster)

		return frozen_clusters + seeded_clusters + machine_clusters # Need to be in the right order




















