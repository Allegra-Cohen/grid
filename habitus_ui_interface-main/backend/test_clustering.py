from .document import Document
from .rng import RNG
from .soft_kmeans import SoftKMeans
from .soft_kmeans2 import SoftKMeans2
from typing import List, Tuple

import cProfile
import numpy as np
import time

class Corpus():
	pass

class Linguist():
	pass

def newDocument(rndgen: RNG, index: int) -> Document:
	text = f"doc{index}"
	vector = [rndgen.random() for _ in range(vector_size)]
	document = Document(index, text, text, text.split(" "), "", "")
	document.set_vector(vector)
	return document


tolerance = 1.0e-12
cluster_count = 5
vector_size = 300
corpus = Corpus()
linguist = Linguist()


def test_soft_clustering(documents: List[Document], seed: int) -> Tuple[List[List[Document]], int, np.array]:
	soft_kmeans = SoftKMeans(corpus, linguist, seed)
	labels_k_tuple = soft_kmeans.generate(documents, cluster_count)
	if labels_k_tuple[0]:
		matrix = soft_kmeans.best_matrix
	else:
		matrix = None
	return labels_k_tuple[0], labels_k_tuple[1], matrix

def test_soft_clustering2(documents: List[Document], seed: int) -> Tuple[List[List[Document]], int, np.array]:
	soft_kmeans = SoftKMeans2(corpus, linguist, seed)
	labels_k_tuple = soft_kmeans.generate(documents, cluster_count)
	return labels_k_tuple

def test_clustering(round: int, n: int) -> Tuple[float, float, bool]:
	seed = round + n
	rndgen = RNG(seed)
	documents = [newDocument(rndgen, i) for i in range(n)]

	# time these separately
	start = time.perf_counter_ns()
	result = test_soft_clustering(documents, seed)
	stop = time.perf_counter_ns()
	elapsed = (stop - start) / 1000000 / 1000 # convert from ns to s

	# time these separately
	
	start = time.perf_counter_ns()
	result2 = test_soft_clustering2(documents, seed)
	stop = time.perf_counter_ns()
	elapsed2 = (stop - start) / 1000000 / 1000 # convert from ns to s

	passes0 = result[0] == result2[0]
	passes1 = result[1] == result2[1]
	if np.any(result[2]) and np.any(result2[2]):
		passes2 = np.allclose(result[2], result2[2], tolerance)
	elif not np.any(result[2]) and not np.any(result2[2]):
		passes2 = True
	else:
		passes2 = False
	return elapsed, elapsed2, passes0 and passes1 and passes2


def run():
	sizes = [10, 20, 50, 100, 200, 500, 1000, 2000] #, 5000, 10000, 20000, 50000, 100000]
	for round in range(1):
		for size in sizes:
			elapsed, elapsed2, result = test_clustering(round, size)
			print(round, size, elapsed, elapsed2, result, sep="\t")

if __name__ == "__main__":
	print("Keith was here!")
	cProfile.run("run()")
