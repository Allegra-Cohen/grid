from backend import Backend

class Frontend():
	def __init__(self, path: str):
		self.backend = Backend(path)
