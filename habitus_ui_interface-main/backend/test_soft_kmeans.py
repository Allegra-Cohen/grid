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

def test_generate() -> bool:
	soft_kmeans = SoftKMeans(corpus, linguist)
	documents = [
		newDocument(0, "doc0", [1.0, 1.1, 1.2]),
		newDocument(1, "doc1", [2.0, 2.1, 2.2]),
		newDocument(2, "doc2", [3.0, 3.1, 3.2]),
		newDocument(3, "doc3", [4.0, 4.1, 4.2]),
		newDocument(4, "doc4", [5.0, 5.1, 5.2])
	]

	expected_labels = [[0], [0], [], [1], [1]]
	expected_k = 2
	expected_matrix = [
		[1.00000000e+00, 9.09494702e-13],
		[1.00000000e+00, 1.48643628e-21],
		[5.00000000e-01, 5.00000000e-01],
		[1.48643628e-21, 1.00000000e+00],
		[9.09494702e-13, 1.00000000e+00]
	]

	labels_k_tuple = soft_kmeans.generate(documents, 2)

	actual_labels = labels_k_tuple[0]
	actual_k = labels_k_tuple[1]
	actual_matrix = soft_kmeans.best_matrix

	print("generate")
	print(actual_labels)
	print(actual_k)
	print(actual_matrix)

	passes = actual_labels == expected_labels and \
			actual_k == expected_k and \
			np.allclose(actual_matrix, expected_matrix, tolerance)

	soft_kmeans2 = SoftKMeans2(corpus, linguist)
	labels_k2_tuple = soft_kmeans2.generate(documents, 2)
	actual_labels2 = labels_k2_tuple[0]
	actual_k2 = labels_k2_tuple[1]
	actual_matrix2 = labels_k2_tuple[2]

	print("generate")
	print(actual_labels2)
	print(actual_k2)
	print(actual_matrix2)

	passes2 = actual_labels2 == expected_labels and \
			actual_k2 == expected_k and \
			np.allclose(actual_matrix2, expected_matrix, tolerance)

	return passes and passes2


def test_generate_seeded() -> None:
	soft_kmeans = SoftKMeans(corpus, linguist)
	documents = [
		newDocument(0, "doc0", [1.0, 1.1, 1.2]),
		newDocument(1, "doc1", [2.0, 2.1, 2.2]),
		newDocument(2, "doc2", [3.0, 3.1, 3.2]),
		newDocument(3, "doc3", [4.0, 4.1, 4.2]),
		newDocument(4, "doc4", [5.0, 5.1, 5.2])
	]
	seeded_clusters = [
		[documents[1], documents[3]]
	]

	expected_labels = [[1], [0], [0], [0], [0]]
	expected_k = 2
	expected_matrix = [
		[4.96918279e-167, 1.00000000e+000],
		[1.00000000e+000, 0.00000000e+000],
		[1.00000000e+000, 9.09494771e-013],
		[1.00000000e+000, 0.00000000e+000],
		[9.99999997e-001, 3.02430360e-009]
	]

	labels_k_tuple = soft_kmeans.generate(documents, 2, seeded_document_clusters=seeded_clusters)

	actual_labels = labels_k_tuple[0]
	actual_k = labels_k_tuple[1]
	actual_matrix = soft_kmeans.best_matrix

	print("generate seeded")
	print(actual_labels)
	print(actual_k)
	print(actual_matrix)

	passes = actual_labels == expected_labels and \
			actual_k == expected_k and \
			np.allclose(actual_matrix, expected_matrix, tolerance)

	soft_kmeans2 = SoftKMeans2(corpus, linguist)
	labels_k2_tuple = soft_kmeans2.generate(documents, 2, seeded_clusters=seeded_clusters)
	actual_labels2 = labels_k2_tuple[0]
	actual_k2 = labels_k2_tuple[1]
	actual_matrix2 = labels_k2_tuple[2]

	print("generate seeded")
	print(actual_labels2)
	print(actual_k2)
	print(actual_matrix2)

	passes2 = actual_labels2 == expected_labels and \
			actual_k2 == expected_k and \
			np.allclose(actual_matrix2, expected_matrix, tolerance)

	return passes and passes2

def test_run_soft_clustering() -> bool:
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
	actual_result2 = soft_kmeans2._run_soft_clustering(np_doc_to_seeded_k, clusters, np_doc_vecs, document_seeded_counts)
	print("run_soft_clustering2", actual_result)
	passes2 = np.allclose(actual_result2, expected_result, tolerance)
	return passes and passes2


if __name__ == "__main__":
	result = test_generate()
	print(result)
	result = test_generate_seeded()
	print(result)
	result = test_run_soft_clustering()
	print(result)
