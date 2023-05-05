from .corpus import Corpus
from .document import Document
from .linguist import Linguist

class ClusterGenerator():
	def __init__(self, corpus: Corpus, linguist: Linguist):
		self.corpus = corpus
		self.linguist = linguist

	def generate(self, documents: list[Document], k: float):
		pass
