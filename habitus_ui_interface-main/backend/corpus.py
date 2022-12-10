import gensim.downloader as api
from gensim.models import KeyedVectors
import json
import numpy as np
import pandas as pd
import spacy
import os.path
import shutil

from document import Document
from linguist import Linguist
from mathematician import get_dist_between_docs
from mathematician import get_pmi
from row import Row

class Corpus():
	def __init__(self, path: str, clean_supercorpus_filename: str, row_labels_filename: str, grid_filename: str, rows: list[Row], anchor: str, anchor_book: dict[list[str]], linguist: Linguist, tfidf_pmi_weight: float, recalculate_pmi = False, recalculate_vectors = False):
		self.path = path
		self.clean_supercorpus_filename = clean_supercorpus_filename.split(".")[0]
		self.anchor = anchor
		self.grid_filename = grid_filename.split(".")[0]
		self.unique_filename = self.clean_supercorpus_filename + '_' + self.anchor + '_' + self.grid_filename

		self.row_labels_filename = row_labels_filename
		self.rows = rows

		self.anchor_book = anchor_book

		self.linguist = linguist
		self.tfidf_pmi_weight = tfidf_pmi_weight
		self.documents: list[Document] = self.load_anchored_documents(anchor == 'load_all')
		self.initialize(recalculate_pmi, recalculate_vectors)

	def initialize(self, recalculate_pmi, recalculate_vectors):
		print(self.clean_supercorpus_filename)
		print(self.anchor)
		print(self.grid_filename)
		print(self.documents)
		vector_texts = [document.get_vector_text() for document in self.documents]
		self.counts = self.linguist.word_vectorizer.fit_transform(vector_texts).toarray()
		self.words = self.linguist.word_vectorizer.get_feature_names_out()
		self.tfidf = self.linguist.tfidf_vectorizer.fit_transform(vector_texts)
		self.word_indices = {k: i for i, k in enumerate(list(self.words))}
		words = [word for document in self.documents for word in document.tokens]
		self.words_in_docs = list(set(words))
		
		self.anchor_index = None #self.word_indices[self.anchor]
		self.pmi = None #self.load_pmi(self.grid_filename + '_pmi_matrix_lem.npy', recalculate_pmi)
		self.load_vectors(self.documents)
		self.doc_distances = self.load_distances(self.unique_filename + '_doc_distances_lem.npy')

	# def load_pmi(self, filename: str, recalculate: bool):
	# 	if (not os.path.isfile(self.path + filename)) or recalculate:
	# 		pmi = self.save_pmi(self.documents)
	# 	pmi = np.load(self.path + filename)
	# 	pmi[np.isnan(pmi)] = 0
	# 	pmi[pmi == np.inf] = 0
	# 	pmi[pmi == -1 * np.inf] = 0
	# 	return pmi

	# def save_pmi(self, documents: list[Document]):
	# 	print("Calculating PMI matrix ... \n")
	# 	return get_pmi(self.path, documents, self.words, k = 0, grid_filename = self.grid_filename, window = 1)  

	def load_distances(self, filename: str):
		doc_distances = np.load(self.path + filename)
		return doc_distances


	# The loaded vectors are stored directly in the documents.
	def load_vectors(self, documents: list[Document]):
		suffix = 'doc_vecs_lem.json'
		if os.path.isfile(self.path + self.unique_filename + '_' +  suffix): # If the embeddings already exist for this Grid, load them
			filename = self.path + self.unique_filename + '_' +  suffix
		elif os.path.isfile(self.path + self.clean_supercorpus_filename + '_' +  suffix): # Or if the embeddings for the supercorpus exist, load those
			filename = self.path + self.clean_supercorpus_filename + '_' +  suffix
			shutil.copy(filename, self.path + self.unique_filename + '_' + suffix)
			shutil.copy(self.path + self.clean_supercorpus_filename + '_doc_distances_lem.npy', self.path + self.unique_filename + '_doc_distances_lem.npy')
		else: # Otherwise, you need to calculate embeddings for the entire supercorpus, and then copy files for this specific Grid.
			all_documents = self.load_anchored_documents(load_all = True)
			self.save_vectors(all_documents)
			filename = self.path + self.clean_supercorpus_filename + '_' +  suffix
			shutil.copy(filename, self.path + self.unique_filename + '_' + suffix)
			shutil.copy(self.path + self.clean_supercorpus_filename + '_doc_distances_lem.npy', self.path + self.unique_filename + '_doc_distances_lem.npy')

		with open(filename, 'r') as file:
			vectors = json.load(file)

		for document in documents:
			vector = vectors[document.get_vector_text()]
			document.set_vector(vector)

	def save_vectors(self, documents: list[Document]):
		print("Calculating vector embeddings ... \n ")
		# model = api.load('word2vec-google-news-300')
		filename = "/Users/allegracohen/Documents/Postdoc/habitus/odin_project/keith_glove/glove_to_word2vec.habitus1.300d.txt"
		model = KeyedVectors.load_word2vec_format(filename)
		doc_distances, doc_vecs = get_dist_between_docs(documents, self.word_indices, model, self.tfidf, self.linguist.tfidf_vectorizer, None, self.anchor, None)
		np.save(self.path + self.clean_supercorpus_filename + '_doc_distances_lem.npy', doc_distances)
		with open(self.path + self.clean_supercorpus_filename + '_doc_vecs_lem.json', 'w') as file:
			json.dump({k: v.tolist() for k, v in doc_vecs.items()}, file) 



	# def adjust_for_anchor(self, key, value, add_or_remove):
	# 	if add_or_remove == "'add'":
	# 		if key in self.anchor_book.keys():
	# 			self.anchor_book[key] = self.anchor_book[key] + [value]
	# 		else:
	# 			self.anchor_book[key] = [value]

	# 		self.documents = self.load_anchored_documents() # Using the new anchor book
	# 		self.initialize(recalculate_pmi = True, recalculate_vectors = False)
	# 		self.load_vectors(self.grid_filename + '_doc_vecs_lem.json', self.documents, recalculate = True) # This is terrible! You shouldn't recalculate everything, you just need embeddings for the new documents.

	# 	else:
	# 		if key in self.anchor_book.keys() and value in self.anchor_book[key]:
	# 			self.anchor_book[key] = [v for v in self.anchor_book[key] if v != value]
	# 			self.documents = [d for d in self.documents if value not in d.tokens]
	# 			for i, d in enumerate(self.documents):
	# 				d.index = i
	# 		self.initialize(recalculate_pmi = True, recalculate_vectors = False) # Need to recalculate TFIDF and PMI regardless.
	# 	return self.documents


	def load_row_labels(self):
		lines = pd.read_csv(self.path + self.row_labels_filename, header = 0)
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
						pre_context = ' '.join(list(lines.loc[index - 4:index-1, 'readable']))
						post_context = ' '.join(list(lines.loc[index+1:index+4, 'readable']))
						document = Document(doc_i, stripped, readable, tokens, pre_context, post_context, memberships = memberships)
						documents.append(document)
						doc_i += 1 # Need to keep this separate because might be a subset of label file
					except IndexError:
						print("Line not found in row_labels: ", readable)
		return documents
	

	@staticmethod
	def load_corpus_lines(path: str, filename: str):
		lines = pd.read_csv(path + filename + '.csv', header = 0)
		return lines

	# Load the corpus lines and save the clean lines.
	@staticmethod
	def clean_corpus(path: str, corpus_filename: str, clean_filename: str, synonym_book: list[list[str]]):
		linguist = Linguist()
		nlp = spacy.load("en_core_web_sm")
		corpus_lines = Corpus.load_corpus_lines(path, corpus_filename)
		stripped_corpus = list(corpus_lines['sentence'].apply(linguist.clean_text, args = (nlp, False, False, True, synonym_book)).reset_index()['sentence'])
		readable_corpus = list(corpus_lines['sentence'].apply(linguist.clean_text, args = (nlp, True, False, False, None)).reset_index()['sentence'])
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

