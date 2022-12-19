import numpy as np
import re
import string
import spacy

from document import Document
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

	def find_relevant_docs(self, documents: list[Document], anchor: str) -> list[Document]:

		anchorType = None

		if '&' in anchor:
			anchors = anchor.replace(' ','').split('&')
			anchorType = '&'
		else: 
			anchors = anchor.replace(' ','').split('|') # Ok so the default here is or, and it will only work for one type of boolean
			anchorType = '|'

		anchors = [self.nlp(anchor)[0].lemma_ for anchor in anchors]

		def has_anchor(anchor: str, document: Document) -> bool:
			words = self.tokenize(document.get_vector_text())
			return any(anchor in word for word in words)

		if anchor == None:
			return documents.copy()
		else:
			possible_docs = [[document.get_index() for document in documents if has_anchor(anchor, document)] for anchor in anchors]
			if anchorType == "&":
				result = list(set.intersection(*map(set, possible_docs)))
			else:
				result = list(set.union(*map(set, possible_docs)))
			result = [doc for doc in documents if doc.get_index() in result] # Not a great way to handle this
			return result

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
		top_words = sorted((((np.mean(word_tfidf[word])), word)  for i, word in enumerate(all_words) if word != anchor_word), reverse = True)[0:n]
		return top_words
