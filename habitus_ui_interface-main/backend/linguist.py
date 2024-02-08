import numpy as np
import pandas as pd
import re
import string
import spacy

from .document import Document
from eldar import Query
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer

class Linguist():
	def __init__(self):
		self.word_vectorizer = CountVectorizer(analyzer = 'word', tokenizer = word_tokenize)
		self.tfidf_vectorizer = TfidfVectorizer(tokenizer = word_tokenize)
		self.nlp = spacy.load("en_core_web_sm")

	def tokenize(self, text: str) -> list[str]:
		return word_tokenize(text)

	def miniclean(self, text):
		remove_uni =  ''.join(["'" if ord(i) == 8217 else i for i in text])
		remove_uni = ''.join([i if ord(i) < 128 else ' ' for i in remove_uni])
		no_digits = ''.join([r for r in remove_uni if not r.isdigit()])
		cleaned = no_digits.lower().translate(str.maketrans(string.punctuation, ' '*len(string.punctuation))).strip()
		return cleaned

	def clean_text(self, text, readable = False, allow_stopwords = False, lemmatize = False):

		stop = set(stopwords.words('english') + list(string.punctuation) + ['', ' ', '…', 'also'])

		conj = ['didn', ' t ', ' don ', ' won ', 'isn', ' i ', ' d ', ' ll ', 'doesn', 'wasn', 'wouldn', 'hasn', 'couldn']
		junk = [' pape ', ' dr ', ' fall ', '\x0c', '\n', '\t', 'e', 'g', 'etc']
		# remove_uni =  [''.join(["'" if ord(i) == 8217 else i for i in s]) for s in corpus['sentence']]
		remove_uni = ''.join([i if ord(i) < 128 else ' ' for i in text])
		if readable:
			remove_uni = re.sub(' +', ' ', remove_uni)
			remove_uni = re.sub('\n', '', remove_uni)
			remove_uni = re.sub('\t', '', remove_uni)
			remove_uni = re.sub('~', '', remove_uni)
			remove_uni = re.sub('/', '', remove_uni)
			return remove_uni
		remove_uni = ''.join([i if ord(i) < 128 else ' ' for i in remove_uni])
		no_digits = ''.join([r for r in remove_uni if not r.isdigit()])
		cleaned = no_digits.lower().translate(str.maketrans(string.punctuation, ' '*len(string.punctuation))).strip()
		for c in conj:
			cleaned = cleaned.replace(c, ' ')
		if not allow_stopwords:
			if lemmatize:
				cleaned = ' '.join(w.lemma_ for w in self.nlp(cleaned) if str(w) not in stop and str(w) not in junk)
			else:
				cleaned = ' '.join(w for w in cleaned.split(' ') if w not in stop and w not in junk)
		cleaned = re.sub(' +', ' ', cleaned)

		return cleaned

	def prep_for_eldar(self, anchor: str):
			anchors = []
			for a in re.split(r'(\(|\)| )', anchor):
				next_part = a
				if next_part not in ['AND', 'OR', 'NOT', '(', ')', '', ' ']:
					next_part = self.clean_text(a, lemmatize = True)
					if len(anchors) > 0 and next_part != '' and next_part != ' ':
						last_part = anchors[next(a for a in range(len(anchors) - 1, -1, -1) if anchors[a] != ' ')]
						if last_part not in ['AND', 'OR', 'NOT', '(', ')', '', ' ']:
							next_part = last_part + ' AND ' + next_part
							anchors.remove(last_part)
				anchors.append(next_part)
			anchors = re.sub(r'\(\s*', '(', ''.join(anchors))
			anchors = re.sub(r'\s*\)', ')', anchors)
			anchors = re.sub(' +', ' ', anchors).strip()
			return anchors

	def find_relevant_docs(self, documents: list[Document], anchor: str) -> list[Document]:

		def has_anchor(query, document: Document) -> bool:
			return query(document.get_vector_text())

		query = Query(self.prep_for_eldar(anchor))

		if anchor == None:
			return documents.copy()
		else:
			result = [document for document in documents if has_anchor(query, document)]
			return result

	def record_words(self, scored_words, n):
		cluster_name = '_'.join([scored_word[1] for scored_word in scored_words[0:n]])
		file_name = f"cluster_{cluster_name}.csv"
		data_frame = pd.DataFrame(scored_words)
		data_frame.columns = ["score", "word"]
		data_frame = data_frame[["word", "score"]]
		data_frame.to_csv(file_name, index=False)

	def get_cluster_name(self, n, documents: list[Document], tfidf, anchor_word):
		word_tfidf = {}
		for doc in documents:
			di = doc.get_index()
			for word in doc.tokens:
				val = tfidf[di, self.tfidf_vectorizer.vocabulary_[word]]
				if word in word_tfidf:
					word_tfidf[word] += val
				else:
					word_tfidf[word] = [val]

		words = [word for document in documents for word in document.tokens]
		all_words = list(set(words))
		sorted_words = sorted((((np.mean(word_tfidf[word])), word) for i, word in enumerate(all_words) if word != anchor_word), reverse = True)
		self.record_words(sorted_words, n)
		top_words = sorted_words[0:n]
		return top_words
