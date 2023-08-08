from .document import Document
from .soft_kmeans import SoftKMeans
from .soft_kmeans2 import SoftKMeans2
from typing import List, Tuple

import numpy as np
import random
import time

class Corpus():
	pass

class Linguist():
	pass

def newDocument(rndgen: random, index: int) -> Document:
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


def test_soft_clustering(documents: List[Document]) -> Tuple[List[List[Document]], int, np.array]:
	soft_kmeans = SoftKMeans(corpus, linguist)
	labels_k_tuple = soft_kmeans.generate(documents, 5)
	matrix = soft_kmeans.best_matrix
	return labels_k_tuple[0], labels_k_tuple[1], matrix

def test_soft_clustering2(documents: List[Document]) -> Tuple[List[List[Document]], int, np.array]:
	soft_kmeans = SoftKMeans2(corpus, linguist)
	labels_k_tuple = soft_kmeans.generate(documents, 5)
	return labels_k_tuple

def test_clustering(n: int) -> Tuple[int, int, bool]:
	rndgen = random.Random(n)
	documents = [newDocument(rndgen, i) for i in range(n)]

	# time these separately
	start = time.perf_counter_ns()
	result = test_soft_clustering(documents)
	stop = time.perf_counter_ns()
	elapsed = (stop - start) / 1000000 # convert from ns to ms

	# time these separately
	
	start = time.perf_counter_ns()
	result2 = test_soft_clustering2(documents)
	stop = time.perf_counter_ns()
	elapsed2 = (stop - start) / 1000000 # convert from ns to ms

	passes0 = result[0] == result2[0]
	passes1 = result[1] == result2[1]
	passes2 = np.allclose(result[2], result2[2], tolerance)
	return elapsed, elapsed2, passes0 and passes1 and passes2


if __name__ == "__main__":
	sizes = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
	for size in sizes:
		elapsed, elapsed2, result = test_clustering(size)
		print(size, elapsed, elapsed2, result)
