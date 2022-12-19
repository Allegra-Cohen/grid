import gensim.downloader as api
from gensim.models import KeyedVectors
import json
import numpy as np
import pandas as pd
import spacy
import os.path
import shutil
import csv

from document import Document
from linguist import Linguist
from mathematician import get_dist_between_docs
from row import Row

class Corpus():
	def __init__(self, path: str, clean_supercorpus_filename: str, row_labels_filename: str, rows: list[Row], anchor: str, anchor_book: dict[list[str]], linguist: Linguist, preexisting = None):
		self.path = path
		self.clean_supercorpus_filename = clean_supercorpus_filename
		self.anchor = anchor

		self.row_labels_filename = row_labels_filename
		self.rows = rows

		self.anchor_book = anchor_book

		self.model = None
		self.model_filename = "/Users/allegracohen/Documents/Postdoc/habitus/odin_project/keith_glove/glove_to_word2vec.habitus1.300d.txt"
		self.linguist = linguist
		self.documents: list[Document] = self.load_anchored_documents(anchor == 'load_all')
		self.initialize(preexisting)

	def initialize(self, preexisting = None):
		vector_texts = [document.get_vector_text() for document in self.documents]
		self.counts = self.linguist.word_vectorizer.fit_transform(vector_texts).toarray()
		self.words = self.linguist.word_vectorizer.get_feature_names_out()
		self.tfidf = self.linguist.tfidf_vectorizer.fit_transform(vector_texts)
		self.word_indices = {k: i for i, k in enumerate(list(self.words))}
		words = [word for document in self.documents for word in document.tokens]
		self.words_in_docs = list(set(words))
		
		self.load_vectors(self.documents, preexisting)
		self.doc_distances = self.load_distances(self.clean_supercorpus_filename + '_doc_distances_lem.npy')


	def load_distances(self, filename: str):
		doc_distances = np.load(self.path + filename)
		return doc_distances


	# The loaded vectors are stored directly in the documents.
	def load_vectors(self, documents: list[Document], preexisting = None):
		suffix = 'doc_vecs_lem.json'
		if os.path.isfile(self.path + self.clean_supercorpus_filename + '_' +  suffix): # If the embeddings for the supercorpus exist, load those.
			print("Looking for: ", self.clean_supercorpus_filename)
			filename = self.path + self.clean_supercorpus_filename + '_' +  suffix
		else: # Otherwise, you need to calculate embeddings for the supercorpus. This line shouldn't be reached if the user relied on us for corpus pre-processing, but they may want to provide their own corpus (e.g., different delimiters)
			all_documents = self.load_anchored_documents(load_all = True)
			self.save_vectors(all_documents, preexisting)
			filename = self.path + self.clean_supercorpus_filename + '_' +  suffix

		with open(filename, 'r') as file:
			vectors = json.load(file)

		valid_documents = []
		for document in documents:
			if document.memberships:
				vector = vectors[document.get_vector_text()]
				if not np.isnan(np.array(vector)).any():
					document.set_vector(vector)
					valid_documents.append(document) # Only show docs in the Grid that have row labels and non-nan vectors
		self.documents = valid_documents

	def save_vectors(self, documents: list[Document], preexisting = None):
		print("Couldn't find vector files. Calculating vector embeddings ... \n ")
		if not self.model:
			self.model = KeyedVectors.load_word2vec_format(self.model_filename)
		doc_distances, doc_vecs = get_dist_between_docs(documents, self.word_indices, self.model, self.tfidf, self.linguist.tfidf_vectorizer, None, self.anchor, None, preexisting)
		np.save(self.path + self.clean_supercorpus_filename + '_doc_distances_lem.npy', doc_distances)
		with open(self.path + self.clean_supercorpus_filename + '_doc_vecs_lem.json', 'w') as file:
			json.dump({k: v.tolist() for k, v in doc_vecs.items()}, file) 


	def load_row_labels(self):
		lines = pd.DataFrame()
		if os.path.isfile(self.path + self.row_labels_filename + '.csv'):
			lines = pd.read_csv(self.path + self.row_labels_filename + '.csv', header = 0)
		return lines


	def load_anchored_documents(self, load_all = False) -> list[Document]:
		lines = self.load_corpus_lines(self.path, self.clean_supercorpus_filename)
		labels = self.load_row_labels()
		documents = []
	
		doc_i = 0
		for index, line in lines.iterrows():
			if type(line.stripped) == str:
				stripped = line['stripped']
				readable = line['readable']
				tokens = self.linguist.tokenize(stripped)

				# TODO: This should be replaced by something sensible like getting a boolean from the user OR finding close-enough words via embeddings.
				if self.anchor in list(self.anchor_book.keys()): # Look for the relevant list that has words related to the anchor
					or_list = self.anchor_book[self.anchor] + [self.anchor]
					relevant = any([any(or_word in word for word in tokens) for or_word in or_list])
				else:
					relevant = any(self.anchor in word for word in tokens)
					
				if relevant or load_all: # If there is no anchor, load the whole thing
					try:
						label_line = [(i,l) for i,l in labels.iterrows() if l['stripped'] == stripped][0]
						memberships = [label_line[1][row.name] == 1 for row in self.rows]
					except IndexError:
						memberships = []
						# print("Line not found in row_labels: ", readable)
					pre_context = ' '.join(list(lines.loc[index - 4:index-1, 'readable']))
					post_context = ' '.join(list(lines.loc[index+1:index+4, 'readable']))
					document = Document(doc_i, stripped, readable, tokens, pre_context, post_context, memberships = memberships)
					documents.append(document)
					doc_i += 1 # Need to keep this separate because might be a subset of label file
		return documents
	

	@staticmethod
	def load_corpus_lines(path: str, filename: str):
		lines = pd.read_csv(path + filename + '.csv', header = 0)
		return lines

	# Load the corpus lines and save the clean lines.
	@staticmethod
	def clean_corpus(path: str, corpus_filename: str, clean_filename: str):
		linguist = Linguist()
		nlp = spacy.load("en_core_web_sm")
		corpus_lines = Corpus.load_corpus_lines(path, corpus_filename)
		stripped_corpus = list(corpus_lines['sentence'].apply(linguist.clean_text, args = (False, False, True)).reset_index()['sentence'])
		readable_corpus = list(corpus_lines['sentence'].apply(linguist.clean_text, args = (True, False, False)).reset_index()['sentence'])
		pd.DataFrame({'stripped': stripped_corpus, "readable": readable_corpus}).to_csv(path + clean_filename)

	# Question for Keith: Do we need these?
	# @staticmethod
	# def load_corpus_documents(path: str, filename: str) -> list[str]:
	# 	lines = Corpus.readCorpusLines(path, filename)
	# 	documents = list(lines['sentences'])
	# 	return documents

	# @staticmethod
	# def load_clean_lines(path: str, filename: str):
	# 	lines = pd.read_csv(path + filename, header = 0)
	# 	return lines

	# @staticmethod
	# def load_clean_documents(path: str, filename: str) -> list[tuple[str, str]]:
	# 	lines = Corpus.load_clean_lines(path, filename)
	# 	stripped_documents = list(lines['stripped']) 
	# 	readable_documents = list(lines['readable'])
	# 	documents = zip(stripped_documents, readable_documents)
	# 	return documents

