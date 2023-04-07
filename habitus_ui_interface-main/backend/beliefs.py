from dataclasses import dataclass
import pandas

@dataclass
class Belief:
	id: int
	belief: str
	title: str
	author: str
	year: int

class Beliefs():
	def __init__(self, path: str, filename: str):
		data_frame = pandas.read_table(path + filename, index_col = 0, header = 0)
		beliefs = [values for index, values in enumerate(data_frame.values.tolist())]
		rows = data_frame.apply(lambda row: Belief(row, row['belief'], row['title'], row['author'], row['year']), axis = 1)
		# row_to_docs[r] = [d for d in list(df.loc[df[r] == 1, 'readable'])]

		# read all the beliefs into an array of beliefs
		print("Keith was here")

	def ground(self, text: str, k: int) -> list[Belief]:
		# Just pick k random beliefs from the list
		pass