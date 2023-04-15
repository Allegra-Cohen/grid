import unittest

from .backend import Backend
from .grid import Grid

class GridTest(unittest.TestCase):

	def setUp(self):
		backend: Backend = Backend('./process_files/')
		self.grid: Grid = backend.get_grid(6)

	def test_delete_document(self):
		self.assertEqual(len(self.grid.clusters), 6, "should have correct number of initial clusters")
		self.grid.delete_document(0, 2)
		self.assertEqual(len(self.grid.clusters), 6, "should have correct number of clusters after deleting one document")
		self.grid.delete_document(0, 2)
		self.assertEqual(len(self.grid.clusters), 5, "should have correct number of clusters after deleting two documents")

if __name__ == '__main__':
	unittest.main()
