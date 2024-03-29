from .document import Document

# These are the columns of the Grid. Documents have membership in one or more clusters.
class Cluster():

	def __init__(self, name: str, documents: list[Document], frozen: bool = False):
		self.name = name
		self.frozen = frozen
		if self.frozen:
			self.documents = documents              # A list of all the documents in this cluster
			self.human_documents = documents.copy() # human_documents is a subset of documents.
		else:
			self.documents = documents
			self.human_documents = []  # A list of documents put here by a human. This is only updated during the modification step.

	# Say whether there are any documents.
	def __bool__(self) -> bool:
		return not not self.documents

	def is_frozen(self) -> bool:
		return self.frozen

	def freeze(self):
		self.frozen = True

	def is_seeded(self) -> bool:
		return not not self.human_documents and not self.is_frozen()

	def remove(self, document: Document) -> Document:
		if document in self.documents:
			self.documents.remove(document)
		if document in self.human_documents:
			self.human_documents.remove(document)
			if not self.human_documents:
				# Removing the last human document will automatically unfreeze the cluster.
				self.frozen = False

	def insert(self, document: Document):
		if document not in self.documents:
			self.documents.append(document)
			self.documents.sort(key=lambda x: x.index) # Do this so that the sentences come up in numerical order in the GUI
			if document not in self.human_documents:
				self.human_documents.append(document)
				self.human_documents.sort(key=lambda x: x.index)


	def print_yourself(self, cindex: int):
		print(str(cindex) + ". Cluster ", self.name, " : -----------------")
		for index, document in enumerate(self.documents):
			if document in self.human_documents:
				print(str(index) + ". ( user - added )   ", document.readable)
			else:
				print(str(index) + ". ( machine - added )   ", document.readable)
		print(" ---------------------------------- ")

	def set_documents(self, documents: list[Document]):
		self.documents = documents

	def set_name(self, name: str, freeze: bool):
		self.name = name
		if freeze:
			self.frozen = True
			add_these = [doc for doc in self.documents if doc not in self.human_documents]
			self.human_documents += add_these
			self.human_documents.sort(key=lambda x: x.index)

