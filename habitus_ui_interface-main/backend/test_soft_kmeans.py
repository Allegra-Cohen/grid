from .soft_kmeans import SoftKMeans

import math
import numpy as np

class Corpus():
	pass

class Linguist():
	pass

class Document():
	def __init__(self, vector, text):
		self.vector = np.array(vector)
		self.text = text

	def __str__(self):
		return self.text + self.vector

tolerance = 1.0e-12

documents = [
	Document([1.0, 1.1, 1.2], "doc0"),
	Document([2.0, 2.1, 2.2], "doc1"),
	Document([3.0, 3.1, 3.2], "doc2"),
	Document([4.0, 4.1, 4.2], "doc3"),
	Document([5.0, 5.1, 5.2], "doc4")
]
clusters = [
	[documents[0], documents[1]],
	[documents[2], documents[3], documents[4]]
]

corpus = Corpus()
linguist = Linguist()
k = 3
soft_k_means = SoftKMeans(corpus, linguist)
# soft_k_means.documents = np.array(documents, dtype = "object") # as per generate()
# soft_k_means.doc_vecs = np.array([document.vector for document in documents])
# soft_k_means.k_max = min(int(math.floor(len(documents) / 2)), k)
# soft_k_means.clusters = clusters
# i = 2

def test_generate() -> None:
	labels_k_tuple = soft_k_means.generate(documents, 2)
	result = soft_k_means.clusters
	print(result)
	return result

def test_initialize_cluster_random_pair() -> float:
	seeded_clusters = [
		[documents[0], documents[1]]
	]

	soft_k_means.k = max(2, len(seeded_clusters))
	soft_k_means._initialize_clusters_random_pair(seeded_clusters)
	result1 = soft_k_means.clusters.tolist()
	result2 = result1.tolist()
	result3 = str(result2)
	print("initialize_cluster_random_pair", result3)
	return result

def test_run_soft_clustering() -> None:
	soft_k_means.clusters = clusters
	d2s_extended = np.array([])
	soft_k_means._run_soft_clustering(d2s_extended)
	actual_result = soft_k_means.matrix
	expected_result = [
		[1.00000000e+00, 2.75815402e-16],
		[1.00000000e+00, 9.00379925e-13],
		[3.02155525e-04, 9.99697844e-01],
		[1.27300093e-88, 1.00000000e+00],
		[1.31318672e-11, 1.00000000e+00]
	]
	print("run_soft_clustering", result)
	return result


if __name__ == "__main__":
	result = test_generate()
	# result = test_initialize_cluster_random_pair()
	# result = test_run_soft_clustering()
