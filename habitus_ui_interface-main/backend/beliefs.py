import math
import nltk
import numpy
import pandas
import random
import shutil
import string

from .linguist import Linguist
from gensim.models import KeyedVectors

class Belief:
	def __init__(self, id: int, values: list) -> None:
		self.id: int = self.clean_integer(id, -1)
		self.belief: str = self.clean_string(values[0], "")
		self.title: str = self.clean_string(values[1], "")
		self.author: str = self.clean_string(values[2], "")
		self.year: int = self.clean_integer(values[3], -1)

	def clean_string(self, string: str, default_value: str) -> str:
		bad = string is None or string == "None" or (type(string) == float and math.isnan(string))
		some_string = string if not bad else default_value
		return some_string

	def clean_integer(self, integer: int, default_value: str) -> str:
		bad = integer is None or (type(integer) == float and math.isnan(integer))
		some_integer = str(integer) if not bad else default_value
		return some_integer

	def to_json(self) -> dict:
		return {
			"id": self.id,
			"belief": self.belief,
			"title": self.title,
			"author": self.author,
			"year": self.year
		}

class Beliefs():
	def __init__(self, path: str, linguist: Linguist):
		self.encoding = "utf-8"
		self.beliefs_filepath = path + "beliefs.tsv"
		self.vectors_filepath = path + "beliefs-vectors.txt"
		self.model_filepath = path + "glove.6B.300d.txt"
		self.reset()
		self.model = None # The model will be sticky because it doesn't change.
		self.width = 0
		self.empty_vector = []

		self.linguist = linguist
		self.nlp = linguist.nlp
		self.stopwords = set(nltk.corpus.stopwords.words('english') + list(string.punctuation) + ['', ' ', '…', 'also'])
		self.parts_of_speech = set(['NOUN', 'PROPN', 'VERB', 'ADJ'])

	def load(self) -> None:
		try:
			if not self.beliefs:
				data_frame = pandas.read_table(self.beliefs_filepath, index_col = 0, header = 0, encoding = self.encoding)
				self.beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]
			if not self.vectors:
				# The width of these vectors should match the width of the model!
				self.vectors = KeyedVectors.load_word2vec_format(self.vectors_filepath, no_header = True)
			self.load_model()
		except:
			self.reset()

	def load_model(self):
		if not self.model:
			self.model = KeyedVectors.load_word2vec_format(self.model_filepath, no_header = True)
			self.width = len(self.model['dog'])
			self.empty_vector = numpy.array([numpy.nan] * self.width)

	def reset(self) -> None:
		self.beliefs = None
		self.vectors = None

	def random_ground(self, text_index: int, text: str, k: int, model) -> list[Belief]:
		if self.beliefs:
			seed = hash(text)
			rndgen = random.Random(seed)
			beliefs = rndgen.sample(self.beliefs, k)
			return beliefs
		else:
			return []

	def tokenize(self, text: str) -> list[str]:
		words = self.nlp(text)
		words = [word for word in words if word.lemma_ not in self.stopwords]
		words = [word for word in words if word.pos_ in self.parts_of_speech]
		tokens = [word.lemma_ for word in words]
		return tokens

	def tokenize_with_linguist(self, text: str) -> list [str]:
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

	def ranked_ground(self, text_index: int, text: str, k: int) -> list[Belief]:
		if self.beliefs and self.vectors and self.model:
			vector = self.vectorize(text)
			if vector is not self.empty_vector:
				key_similarity_list = self.vectors.similar_by_vector(vector, k, None)
				index_similarity_list = [(int(key), similarity) for key, similarity in key_similarity_list]
				beliefs = [self.beliefs[index] for index, _ in index_similarity_list]
				return beliefs
			else:
				return []
		else:
			return []

	def ground(self, text_index: int, text: str, k: int) -> list[Belief]:
		indexless_text = text[text.index(' ') + 1:]
		return self.ranked_ground(text_index, indexless_text, k)

	# Read in the beliefs in beliefs_filepath.  For each belief, add a column for the vectors and
	# then save the file as beliefs.csv. 
	def process(self, beliefs_filepath: str):
		try:
			self.load_model()
			self.reset()
			shutil.copyfile(beliefs_filepath, self.beliefs_filepath)
			data_frame = pandas.read_table(self.beliefs_filepath, index_col = 0, header = 0, encoding = self.encoding)
			beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]
			vectors = [self.vectorize(belief.belief) for belief in beliefs]
			with open(self.vectors_filepath, "w", encoding = self.encoding) as file:
				# header = f"{len(vectors)} {len(vectors[0])}"
				# print(header, file = file)
				for index, vector in enumerate(vectors):
					strings = [str(value) for value in vector.tolist()]
					line = str(index) + " " + " ".join(strings)
					print(line, file = file)
			self.beliefs = beliefs
			return {'success': True, 'beliefs_file': self.beliefs_filepath}
		except:
			print(f"{beliefs_filepath} could not be processed.")
			return {'success': False, 'beliefs_file': None}
