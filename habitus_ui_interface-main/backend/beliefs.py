import faiss
import math
import nltk
import numpy
import pandas
import pickle
import random
import shutil
import string

from .linguist import Linguist
from gensim.models import KeyedVectors
from sentence_transformers import SentenceTransformer

class Belief:
	def __init__(self, id: int, values: list) -> None:
		self.id: int = self.clean_integer(id, -1)
		self.belief: str = self.clean_string(values[0], "")
		self.title: str = self.clean_string(values[1], "")
		self.author: str = self.clean_string(values[2], "")
		self.year: int = self.clean_integer(values[3], -1)
		self.context: string = self.clean_string(values[4], "")
		self.sentiment: float = self.clean_float(values[6], 0.0)

	def clean_string(self, value: str, default_value: str) -> str:
		bad = value is None or value == "None" or (type(value) == float and math.isnan(value))
		some_value = value if not bad else default_value
		return some_value

	def clean_integer(self, value: int, default_value: str) -> str:
		bad = value is None or (type(value) == float and math.isnan(value))
		some_value = int(value) if not bad else default_value
		return some_value

	def clean_float(self, value: float, default_value: float) -> float:
		bad = value is None or (type(value) == float and math.isnan(value))
		some_value = value if not bad else default_value
		return some_value

	def to_json(self) -> dict:
		return {
			"id": self.id,
			"belief": self.belief,
			"title": self.title,
			"author": self.author,
			"year": self.year,
			# Skip the context.
			"sentiment": self.sentiment
		}

class Grounder():
	def __init__(self, path: str):
		self.encoding = "utf-8"
		self.beliefs_filepath = path + "beliefs.tsv"
		self.beliefs = None

	def load(self) -> None:
		if not self.beliefs:
			data_frame = pandas.read_table(self.beliefs_filepath, index_col = 0, header = 0, encoding = self.encoding)
			self.beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]

	def reset(self) -> None:
		self.beliefs = None

	def ground(self, text_index: int, text: str, k: int) -> tuple[list[Belief], list[float]]:
		pass

	# Read in the beliefs in beliefs_filepath.
	def process(self, beliefs_filepath: str) -> None:
		self.beliefs = None
		shutil.copyfile(beliefs_filepath, self.beliefs_filepath)
		data_frame = pandas.read_table(self.beliefs_filepath, index_col = 0, header = 0, encoding = self.encoding)
		self.beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]


class RandomGrounder(Grounder):
	def __init__(self, path: str):
		super().__init__(path)

	def ground(self, text_index: int, text: str, k: int) -> tuple[list[Belief], list[float]]:
		if self.beliefs:
			seed = hash(text)
			rndgen = random.Random(seed)
			beliefs = rndgen.sample(self.beliefs, k)
			scores = [rndgen.random() for i in range(k)]
			scores.sort()
			scores.reverse()
			return beliefs, scores
		else:
			return [], []

class RankedGloveGrounder(Grounder):
	def __init__(self, path: str, linguist: Linguist):
		super().__init__(path)
		self.linguist = linguist
		self.vectors_filepath = path + "beliefs-vectors.txt"
		self.model_filepath = path + "glove.6B.300d.txt"
		self.model = None # The model will be sticky because it doesn't change.
		self.width = 0
		self.empty_vector = []
		self.nlp = linguist.nlp
		self.stopwords = set(nltk.corpus.stopwords.words('english') + list(string.punctuation) + ['', ' ', '…', 'also'])
		self.parts_of_speech = set(['NOUN', 'PROPN', 'VERB', 'ADJ'])
		self.vectors = None

	def reset(self) -> None:
		super().reset()
		self.vectors = None

	def load_model(self) -> None:
		if not self.model:
			self.model = KeyedVectors.load_word2vec_format(self.model_filepath, no_header = True)
			self.width = len(self.model['dog'])
			self.empty_vector = numpy.array([numpy.nan] * self.width)

	def load(self) -> None:
		super().load()
		if not self.vectors:
			# The width of these vectors should match the width of the model!
			self.vectors = KeyedVectors.load_word2vec_format(self.vectors_filepath, no_header = True)
		self.load_model()

	def tokenize(self, text: str) -> list[str]:
		words = self.nlp(text)
		words = [word for word in words if word.lemma_ not in self.stopwords]
		words = [word for word in words if word.pos_ in self.parts_of_speech]
		tokens = [word.lemma_ for word in words]
		return tokens

	def tokenize_with_linguist(self, text: str) -> list[str]:
		clean_text = self.linguist.clean_text(text, lemmatize = True)
		tokens = self.linguist.tokenize(clean_text) # These are now lowercase.
		return tokens

	def vectorize(self, text: str):
		print(text)
		tokens = self.tokenize(text)
		print(tokens)
		vector_tokens = [token for token in tokens if token in self.model]
		if vector_tokens:
			vectors = [numpy.array(self.model[token]) for token in vector_tokens]
			sum = numpy.sum(vectors, axis = 0)
			length = numpy.linalg.norm(sum, axis = 0, ord = 2)
			norm = sum / length
		else:
			norm = self.empty_vector
		return norm

	def ground(self, text_index: int, text: str, k: int) -> tuple[list[Belief], list[float]]:
		if self.beliefs and self.vectors and self.model:
			vector = self.vectorize(text)
			if vector is not self.empty_vector:
				key_similarity_list = self.vectors.similar_by_vector(vector, k, None)
				index_similarity_list = [(int(key), similarity) for key, similarity in key_similarity_list]
				beliefs = [self.beliefs[index] for index, _ in index_similarity_list]
				scores = [score for _, score in index_similarity_list]
				return beliefs, scores
			else:
				return [], []
		else:
			return [], []

	# For each belief, add a column for the vectors and then save the file as beliefs.csv.
	def process(self, beliefs_filepath: str) -> None:
		super().process(beliefs_filepath)
		self.load_model()
		vectors = [self.vectorize(belief.belief) for belief in self.beliefs]
		with open(self.vectors_filepath, "w", encoding = self.encoding) as file:
			# header = f"{len(vectors)} {len(vectors[0])}"
			# print(header, file = file)
			for index, vector in enumerate(vectors):
				strings = [str(value) for value in vector.tolist()]
				line = str(index) + " " + " ".join(strings)
				print(line, file = file)

class RankedTransformerGrounder(Grounder):
	def __init__(self, path: str):
		super().__init__(path)
		self.vectors_filepath = path + "beliefs-faiss.txt"
		self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
		self.model = None
		self.embeddings_name = "embeddings"
		self.width = 0
		self.vectors = None

	def reset(self) -> None:
		super().reset()

	def load_model(self) -> None:
		if not self.model:
			self.model = SentenceTransformer(self.model_name)
			self.width = self.model.encode(["dog"]).shape[1]

	def load(self) -> None:
		super().load()
		self.load_model()
		if not self.vectors:
			with open(self.vectors_filepath, "rb") as file:
				data = pickle.load(file)
				embeddings = data[self.embeddings_name]
				index = faiss.IndexFlatIP(self.width)
				index.add(embeddings)
				assert(index.is_trained)
				self.vectors = index

	def ground(self, text_index: int, text: str, k: int) -> list[Belief]:
		# This is a sanity check.
		# for i in range(len(self.beliefs)):
		# 	embeddings = self.model.encode([self.beliefs[i].belief])
		# 	scores_collection, beliefs_indexes_collection = self.vectors.search(embeddings, k)			
		# 	first_score = scores_collection[0][0]
		# 	first_index = beliefs_indexes_collection[0][0]
		# 	second_index = beliefs_indexes_collection[0][0]
		# 	print(i, first_index, first_score)
			# assert first_index == i or second_index == i # doesn't always work
		#	assert 0.99 <= first_score and first_score <= 1.01

		embeddings = self.model.encode([text])
		scores_collection, beliefs_indexes_collection = self.vectors.search(embeddings, k)			
		beliefs_indexes = beliefs_indexes_collection[0]
		beliefs = [self.beliefs[beliefs_index] for beliefs_index in beliefs_indexes]
		scores = scores_collection[0].tolist()
		return beliefs, scores

	def process(self, beliefs_filepath: str) -> None:
		super().process(beliefs_filepath)
		self.load_model()
		texts = [belief.belief for belief in self.beliefs]
		embeddings = self.model.encode(texts)
		with open(self.vectors_filepath, "wb") as file:
			pickle.dump({self.embeddings_name: embeddings}, file, protocol=pickle.HIGHEST_PROTOCOL)

class Beliefs():
	def __init__(self, path: str, linguist: Linguist):
		# self.grounder = RandomGrounder(path)
		# self.grounder = RankedGloveGrounder(path, linguist)
		self.grounder = RankedTransformerGrounder(path)

	def beliefsAvailable(self) -> bool:
		return self.grounder.beliefs is not None

	def load(self) -> None:
		try:
			self.grounder.load()
		except:
			self.grounder.reset()

	def ground(self, text_index: int, text: str, k: int) -> tuple[list[Belief], list[float]]:
		indexless_text = text[text.index(' ') + 1:]
		return self.grounder.ground(text_index, indexless_text, k)

	def process(self, beliefs_filepath: str):
		try:
			self.grounder.process(beliefs_filepath)
			return {'success': True, 'beliefs_file': self.grounder.beliefs_filepath}
		except Exception as exception:
			self.grounder.reset()
			print(f"{beliefs_filepath} could not be processed.")
			return {'success': False, 'beliefs_file': None}
