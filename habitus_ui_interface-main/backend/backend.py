import json
import numpy as np
import os.path
import pandas as pd

from . import corpus_parser
from .beliefs import Belief
from .cluster import Cluster
from .corpus import Corpus
from .grid import Grid
from .linguist import Linguist
from .row import Row
from gensim.models import KeyedVectors

class Backend():
	def __init__(self, path: str):
		self.encoding = "utf-8"
		self.model_filename = "../process_files/glove.6B.300d.txt"

		self.path = path
		self.supercorpus_filename = None
		self.clean_supercorpus_filename = None
		self.row_labels_filename = None
		self.linguist = Linguist()

	def process_supercorpus(self, supercorpus_filepath):
		try:
			supercorpus_name = supercorpus_filepath.rsplit('/', 2)[1] # The folder containing the corpus will become the corpus name
			temporary_clean_supercorpus_filename = 'cleaned_' + supercorpus_name
			row_labels_filename = supercorpus_name + '_row_labels.csv'
			can_update = os.path.isfile(self.path + temporary_clean_supercorpus_filename + '.csv')

			if can_update:
				preexisting = pd.read_csv(self.path + temporary_clean_supercorpus_filename + '.csv')['stripped']
			else:
				preexisting = None
			
			if os.path.isdir(supercorpus_filepath):
				corpus_parser.parse_supercorpus(supercorpus_name, supercorpus_filepath, self.path) # Preprocess the corpus
				
				if not os.path.isfile(self.path + temporary_clean_supercorpus_filename): # Clean the corpus if you need to
					Corpus.clean_corpus(self.path, supercorpus_name, temporary_clean_supercorpus_filename + '.csv')

				stripped = pd.read_csv(self.path + temporary_clean_supercorpus_filename + '.csv')['stripped'] # Need to add "stripped" column to row labels
				row_labels = pd.read_csv(self.path + row_labels_filename)
				row_labels['stripped'] = stripped
				row_labels.to_csv(self.path + row_labels_filename)

				if can_update:
					print(f"Updating files associated with corpus {supercorpus_name}") # If there's already an embedding file, update the existing corpus embedding file, don't recalculate everything.
				else:
					print(f"Creating vector embeddings for corpus {supercorpus_name}") # Otherwise, you have to make the embeddings files.

				Corpus(self.path, temporary_clean_supercorpus_filename, '', [], 'load_all', self.linguist, preexisting) # This will calculate the embeddings. Don't store it because then other grids will be messed up.

				return {'success': True, 'corpus_file': supercorpus_name, 'rows_file': row_labels_filename}
		except IndexError:
			print(f"String {supercorpus_filepath} is not a path")

		print(f"Corpus path {supercorpus_filepath} doesn't exist")
		return {'success': False, 'corpus_file': None, 'rows_file': None}

	def vectorize(self, text: str, model) -> list[float]:
		words = self.linguist.tokenize(text) # TODO: clean these up
		lower_words = [word.lower() for word in words]
		vector_words = [word for word in lower_words if word in model]
		if vector_words:
			vectors = [np.array(model[word]) for word in vector_words]
		else:
			vectors = [np.array([np.nan] * len(model['dog']))]
		sum = np.sum(vectors, axis = 0)
		length = np.linalg.norm(sum, axis = 0, ord = 2)
		norm = sum / length
		list = [str(value) for value in norm.tolist()]
		print(list) # need a vector of floats
		return list

	# Read in the beliefs in beliefs_filepath.  For each belief, add a column for the vectors and
	# then save the file as beliefs.csv. 
	def process_beliefs(self, beliefs_filepath):
		try:
			# copy the file wholesale to beliefs.csv because will need to display
			data_frame = pd.read_table(beliefs_filepath, index_col = 0, header = 0, encoding = self.encoding)
			beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]
			model = KeyedVectors.load_word2vec_format(self.model_filename) # , no_header = True)
			vectors = [self.vectorize(belief.belief, model) for belief in beliefs]
			vectorized_beliefs_filepath = self.path + "beliefs-vectors.csv"			
			with open(vectorized_beliefs_filepath, "w", encoding = self.encoding) as file:
				header = f"{len(vectors)} {len(vectors[0])}"
				file.write(header)
				for vector in vectors:
					line = " ".join(vector)
					file.write(line)
			return {'success': True, 'beliefs_file': vectorized_beliefs_filepath}
		except:
			print(f"{beliefs_filepath} could not be processed.")
			return {'success': False, 'beliefs_file': None}

	def set_superfiles(self, supercorpus_filename, row_filename):
		if os.path.isfile(self.path + supercorpus_filename) and os.path.isfile(self.path + row_filename):
			self.supercorpus_filename = supercorpus_filename.split(".")[0]
			self.row_labels_filename = row_filename.split(".")[0]
			self.clean_supercorpus_filename = 'cleaned_' + self.supercorpus_filename
			if not os.path.isfile(self.path + self.clean_supercorpus_filename): # This line should be redundant if the user relied on us for corpus pre-processing, but they may want to provide their own corpus (e.g., different delimiters)
				Corpus.clean_corpus(self.path, self.supercorpus_filename, self.clean_supercorpus_filename)
			return True
		else:
			return False


	# TODO: Right now filename is also the anchor. frontend needs to handle getting a filename from the GUI and passing it here.
	#       Suggest that filename should be provided when the user creates the Grid (a process which isn't supported yet.)
	def get_grid(self, k: int, anchor: str, grid_filename: str, clustering_algorithm: str) -> Grid:
		print("New grid -- processing documents ... ")
		unique_filename = grid_filename.split(".")[0]
		self.set_up_corpus(anchor)
		grid = Grid.generate(self.path, self.clean_supercorpus_filename, self.row_labels_filename, grid_filename, self.corpus, k, clustering_algorithm)
		return grid


	def load_grid(self, unique_filename: str, clustering_algorithm: str) -> Grid:
		print("Loading grid from root filename ", unique_filename)
		try: 
			specs = pd.read_csv(self.path + unique_filename + '_specs.csv')
			anchor = list(specs['anchor'])[0]
			self.clean_supercorpus_filename = list(specs['corpus'])[0]
			self.row_labels_filename = list(specs['row_filename'])[0]
			self.set_up_corpus(anchor)

			cells = pd.read_csv(self.path + unique_filename + '_cells.csv')
			col_names = pd.unique(cells['col'])
			clusters = self.load_clusters(cells, col_names)
			k = len(col_names)
			grid = Grid(self.path, self.clean_supercorpus_filename, self.row_labels_filename, unique_filename, self.corpus, k, clustering_algorithm, clusters)
		except FileNotFoundError:
			print("That grid doesn't exist. Try creating it and saving it.")
			grid = None

		return grid


	def set_up_corpus(self, anchor: str):
		self.rows = [Row(row_name) for row_name in pd.read_csv(self.path + self.row_labels_filename + '.csv').columns if row_name != 'stripped' and row_name != 'readable' and row_name != 'Unnamed: 0']
		self.corpus = Corpus(self.path, self.clean_supercorpus_filename, self.row_labels_filename, self.rows, anchor, self.linguist)

	# Not sure if this should be in backend, or a method of Grid
	def load_clusters(self, cells, col_names: list[str]):
		frozen_clusters, seeded_clusters, machine_clusters = [], [], []

		for name in col_names:
			# Gotta split the numbers because different corpora may have different indices
			cell_docs = [d.split('.')[1] for d in pd.unique(list(cells.loc[cells['col'] == name, 'readable']))]
			seeded_docs = [d.split('.')[1] for d in pd.unique(list(cells.loc[(cells['seeded_doc']) & (cells['col'] == name), 'readable']))]

			documents, seeded_documents = [], []
			for doc_object in self.corpus.documents:
				corpus_doc = doc_object.readable.split('.')[1]
				if corpus_doc in cell_docs:
					documents.append(doc_object)
				if corpus_doc in seeded_docs:
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




















