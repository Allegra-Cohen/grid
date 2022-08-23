
class Document():
	def __init__(self, index: int, stripped: str, readable: str, tokens: list[str], memberships: list[bool] = []):
		self.index = index
		self.stripped = stripped
		self.readable = readable
		# Tokens can be duplicates.  Get to unique words with list(set(tokens)).
		self.tokens = tokens
		self.memberships = memberships
		self.vector = None

	def __eq__(self, other) -> bool:
		return self.index == other.index

	# Some clustering functions want to sort documents.
	def __lt__(self, other) -> bool:
		return self.stripped < other.stripped

	def is_member(self, index: int) -> bool:
		index in range(len(self.memberships)) and self.memberships[index]

	def get_vector_text(self) -> str:
		return self.stripped

	def get_index(self) -> int:
		return self.index

	def set_vector(self, vector: list[float]):
		self.vector = vector
