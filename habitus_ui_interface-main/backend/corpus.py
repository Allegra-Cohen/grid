import gensim.downloader as api
import json
import numpy as np
import pandas as pd
import spacy

from document import Document
from linguist import Linguist
from mathematician import get_dist_between_docs
from mathematician import get_pmi
from row import Row

class Corpus():
	def __init__(self, path: str, filename: str, rows: list[Row], anchor: str, linguist: Linguist, tfidf_pmi_weight: float):
		self.path = path
		self.filename = filename
		self.rows = rows
		self.anchor = anchor
		self.linguist = linguist
		self.tfidf_pmi_weight = tfidf_pmi_weight
		self.documents: list[Document] = self.load_anchored_documents()
		self.initialize()

	def initialize(self):
		vector_texts = [document.get_vector_text() for document in self.documents]
		self.counts = self.linguist.word_vectorizer.fit_transform(vector_texts).toarray()
		self.words = self.linguist.word_vectorizer.get_feature_names_out()
		self.tfidf = self.linguist.tfidf_vectorizer.fit_transform(vector_texts)
		self.word_indices = {k: i for i, k in enumerate(list(self.words))}
		words = [word for document in self.documents for word in document.tokens]
		self.words_in_docs = list(set(words))
		self.anchor_index = self.word_indices[self.anchor]
		self.pmi = self.load_pmi('pmi_matrix_lem.npy')
		self.load_vectors('doc_vecs_lem.json', self.documents)
		self.doc_distances = self.load_distances('doc_distances_lem.npy')

	def load_pmi(self, filename: str):
		# TODO: Check to see if file is there and if not, save it first.
		pmi = np.load(self.path + 'pmi_matrix_lem.npy')
		pmi[np.isnan(pmi)] = 0
		pmi[pmi == np.inf] = 0
		pmi[pmi == -1 * np.inf] = 0
		return pmi

	def save_pmi(self, documents: list[Document]):
		print("Calculating PMI matrix ... \n")
		get_pmi(self.path, documents, self.words, k = 0, file_suffix = '_lem', window = 1)  

	def load_distances(self, filename: str):
		doc_distances = np.load(self.path + filename)
		return doc_distances

	# The loaded vectors are stored directly in the documents.
	def load_vectors(self, filename: str, documents: list[Document]):
		with open(self.path + filename, 'r') as file:
			vectors = json.load(file)
		for document in documents:
			vector = vectors[document.get_vector_text()]
			document.set_vector(vector)

	def save_vectors(self, path: str, documents: list[Document]):
		print("Calculating vector embeddings ... \n ")
		model = api.load('word2vec-google-news-300')
		doc_distances, doc_vecs = get_dist_between_docs(documents, self.word_indices, model, self.tfidf, self.linguist.tfidf_vectorizer, self.pmi, self.anchor, self.tfidf_pmi_weight)
		np.save(self.path + 'doc_distances_lem.npy', doc_distances)
		with open(path + 'doc_vecs_lem.json', 'w') as file:
			json.dump({k: v.tolist() for k, v in doc_vecs.items()}, file) 

	def load_anchored_lines(self):
		lines = pd.read_csv(self.path + self.filename, header = 0)
		return lines

	def load_anchored_documents(self) -> list[Document]:
		lines = self.load_anchored_lines()
		documents = []
		for index, line in lines.iterrows():
			stripped = line['stripped']
			readable = line['readable']
			tokens = self.linguist.tokenize(stripped)
			memberships = [line[row.name] == 1 for row in self.rows]
			document = Document(index, stripped, readable, tokens, memberships = memberships)
			documents.append(document)
		return documents
	
	@staticmethod
	def load_corpus_lines(path: str, filename: str):
		# It appears that there is a header now.
		# self.corpus =  pd.read_csv(path + filename, header = None)
		# self.corpus.columns = ['sentence']
		lines = pd.read_csv(path + filename, header = 0)
		return lines

	@staticmethod
	def load_corpus_documents(path: str, filename: str) -> list[str]:
		lines = Corpus.readCorpusLines(path, filename)
		documents = list(lines['sentences'])
		return documents

	@staticmethod
	def load_clean_lines(path: str, filename: str):
		lines = pd.read_csv(path + filename, header = 0)
		return lines

	@staticmethod
	def load_clean_documents(path: str, filename: str) -> list[tuple[str, str]]:
		lines = Corpus.load_clean_lines(path, filename)
		stripped_documents = list(lines['stripped']) 
		readable_documents = list(lines['readable'])
		documents = zip(stripped_documents, readable_documents)
		return documents

	# Load the corpus lines and save the clean lines.
	@staticmethod
	def clean(path: str, corpus_filename: str, clean_filename: str, synonym_book: list[list[str]], too_common: list[list[str]]):
		linguist = Linguist()
		nlp = spacy.load("en_core_web_sm")
		corpus_lines = Corpus.load_corpus_lines(path, corpus_filename)
		stripped_corpus = list(corpus_lines['sentence'].apply(linguist.clean_text, args = (nlp, False, False, True, synonym_book, too_common)).reset_index()['sentence'])
		readable_corpus = list(corpus_lines['sentence'].apply(linguist.clean_text, args = (nlp, True, False, False, None)).reset_index()['sentence'])
		pd.DataFrame({'stripped': stripped_corpus, "readable": readable_corpus}).to_csv(path + clean_filename)
