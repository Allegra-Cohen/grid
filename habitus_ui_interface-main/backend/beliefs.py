import math
import pandas
import random

class Belief:
	def __init__(self, id: int, values: list) -> None:
		self.id: int = self.clean_integer(id, -1)
		self.belief: str = self.clean_string(values[0], "")
		self.title: str = self.clean_string(values[1], "")
		self.author: str = self.clean_string(values[2], "")
		self.year: int = self.clean_integer(values[3], -1)

	def clean_string(self, string: str, default_value: str) -> str:
		bad = string is None or (type(string) == float and math.isnan(string))
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
	def __init__(self, path: str, filename: str):
		data_frame = pandas.read_table(path + filename, index_col = 0, header = 0, encoding = "utf-8")
		self.beliefs: list[Belief] = [Belief(index, values) for index, values in enumerate(data_frame.values.tolist())]

	def ground(self, text: str, k: int) -> list[Belief]:
		seed = hash(text)
		rndgen = random.Random(seed)
		beliefs = rndgen.sample(self.beliefs, k)
		return beliefs
