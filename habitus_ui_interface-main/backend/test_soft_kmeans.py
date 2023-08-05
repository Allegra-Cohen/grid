from .document import Document
from .soft_kmeans import SoftKMeans
from .soft_kmeans2 import SoftKMeans2

import math
import numpy as np

class Corpus():
	pass

class Linguist():
	pass

def newDocument(index, text, vector):
	document = Document(index, text, text, text.split(" "), "", "")
	document.set_vector(vector)
	return document


tolerance = 1.0e-12
corpus = Corpus()
linguist = Linguist()

def test_generate() -> None:
	soft_kmeans = SoftKMeans(corpus, linguist)
	soft_kmeans2 = SoftKMeans2(corpus, linguist)
	documents = [
		newDocument(0, "doc0", [1.0, 1.1, 1.2]),
		newDocument(1, "doc1", [2.0, 2.1, 2.2]),
		newDocument(2, "doc2", [3.0, 3.1, 3.2]),
		newDocument(3, "doc3", [4.0, 4.1, 4.2]),
		newDocument(4, "doc4", [5.0, 5.1, 5.2])
	]
	clusters = [
		[documents[0], documents[1]],
		[documents[2], documents[3], documents[4]]
	]

	labels_k_tuple = soft_kmeans.generate(documents, 2)
	labels_k2_tuple = soft_kmeans2.generate(documents, 2)

	return result

# This one runs without seeding.
def test_run_soft_clustering() -> None:
	soft_kmeans = SoftKMeans(corpus, linguist)
	documents = [
		newDocument(0, "doc0", [1.0, 1.1, 1.2]),
		newDocument(1, "doc1", [2.0, 2.1, 2.2]),
		newDocument(2, "doc2", [3.0, 3.1, 3.2]),
		newDocument(3, "doc3", [4.0, 4.1, 4.2]),
		newDocument(4, "doc4", [5.0, 5.1, 5.2])
	]
	soft_kmeans.documents = documents
	np_doc_vecs = np.array([document.vector for document in documents])
	soft_kmeans.doc_vecs = np.array(np_doc_vecs)
	clusters = [
		[documents[0], documents[1]],
		[documents[2], documents[3], documents[4]]
	]
	soft_kmeans.clusters = clusters
	np_doc_to_seeded_k = np.array([])
	soft_kmeans.run_soft_clustering(np_doc_to_seeded_k)
	actual_result = soft_kmeans.matrix
	expected_result = [
		[1.00000000e+00, 2.75815402e-16],
		[1.00000000e+00, 9.00379925e-13],
		[3.02155525e-04, 9.99697844e-01],
		[1.27300093e-88, 1.00000000e+00],
		[1.31318672e-11, 1.00000000e+00]
	]
	print("run_soft_clustering", actual_result)
	passes = np.allclose(actual_result, expected_result, tolerance)

	soft_kmeans2 = SoftKMeans2(corpus, linguist)
	document_seeded_counts = [0, 0, 0, 0, 0]
	actual_result = soft_kmeans2._run_soft_clustering(np_doc_to_seeded_k, clusters, np_doc_vecs, document_seeded_counts)
	print("run_soft_clustering2", actual_result)
	passes = np.allclose(actual_result, expected_result, tolerance)
	return passes


if __name__ == "__main__":
	# result = test_generate()
	# result = test_initialize_cluster_random_pair()
	result = test_run_soft_clustering()
