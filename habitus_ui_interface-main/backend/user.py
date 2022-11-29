import pandas as pd


class User():
	def __init__(self, filename: str, user_id: int = None, flag: int = None):
		self.filename = filename
		self.user_id = user_id
		self.flag = flag

	def set_id(self, user_id):
		self.user_id = user_id

	def assign_flag(self):
		if self.user_id != None:
			user_to_condition = pd.read_csv(self.filename)
			try:
				self.flag = str(user_to_condition.loc[user_to_condition['user'] == self.user_id, 'condition'].item())
			except ValueError:
				print("No condition for user id", self.user_id)
				self.user_id, self.flag = None, None
