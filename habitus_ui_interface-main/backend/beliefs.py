import random
import pandas

class Belief:
	def __init__(self, id: int, values: list) -> None:
		self.id = id
		self.belief: str = values[0]
		self.title: str = values[1]
		self.author: str = values[2]
		self.year: int = values[3]

	def to_json(self) -> dict:
		return {
			"id": self.id,
			"belief": "belief", # self.belief,
			"title": "title", # self.title,
			"author": "author", # self.author,
			"year": self.year
		}

class Beliefs():
	def __init__(self, path: str, filename: str):
		data_frame = pandas.read_table(path + filename, index_col = 0, header = 0)
		self.beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]

	def ground(self, text: str, k: int) -> list[Belief]:
		seed = hash(text)
		rndgen = random.Random(seed)
		beliefs = rndgen.sample(self.beliefs, k)
		return beliefs
