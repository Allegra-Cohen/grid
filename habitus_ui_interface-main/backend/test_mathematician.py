from .mathematician import C_score
from .mathematician import betweenness
from .mathematician import check_convergence
from .mathematician import get_composite
from .mathematician import withinness

import numpy as np

class Document():
	def __init__(self, vector):
		self.vector = vector

documents = [
	Document([1.0, 1.1, 1.2]),
	Document([2.0, 2.1, 2.2]),
	Document([3.0, 3.1, 3.2]),
	Document([4.0, 4.1, 4.2]),
	Document([5.0, 5.1, 5.2])
]

clusters = [
	[documents[0], documents[1]],
	[documents[2], documents[3], documents[4]]
]

def test_composite():
	for cluster in clusters:
		result = get_composite(cluster)
		print("composite", result)
	return True

def test_withinness() -> float:
	result = withinness(clusters)
	print("withinness", result)
	return result

def test_betweenness() -> float:
	result = betweenness(clusters, documents)
	print("betweenness", result)
	return result

def test_C_score() -> float:
	result = C_score(documents, clusters)
	print("C_score", result)
	return result

def test_check_convergence() -> None:
	centroids = np.array([np.mean([d.vector for d in cluster], axis = 0) for cluster in clusters])
	last_centroids = centroids
	centroids = np.array([[0, 0, 0]])
	last_centroids = np.array([[10, 0, -10]])
	result = check_convergence(centroids, last_centroids, 5)
	print(check_convergence, result)


if __name__ == "__main__":
	result = test_composite()
	result = test_withinness()
	result = test_betweenness()
	result = test_C_score()
	result = test_check_convergence()
