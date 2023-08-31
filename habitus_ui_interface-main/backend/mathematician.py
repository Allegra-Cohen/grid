import itertools
import numpy as np
import pandas as pd

from .document import Document

# GENERAL FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- GENERAL FUNCTIONS
# -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- 
# GENERAL FUNCTIONS -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- GENERAL FUNCTIONS

# PMI functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ PMI functions
# Pointwise Mutual Information
def calculate_pmi(cooccurrence_matrix, i, j, mi, mj, total, k, n):
	joint = np.true_divide((cooccurrence_matrix[i,j] + k), (total + k*n))
	frac = np.true_divide(joint, (mi * mj))
	pmi = np.log(frac)
	return pmi

def get_pmi(path, documents: list[Document], all_strings, k, root_filename, window = 1):
	sentences = [document.get_vector_text() for document in documents]
	string_idx = np.array(range(len(all_strings)))
	n = len(all_strings)
	cooccurrence_matrix = np.zeros((n, n))
	for i in range(len(sentences)):
		frame = ' '.join(sentences[i : i + window])
		string_present = [True if s in frame else False for s in all_strings]
		present_clusters = string_idx[string_present]
		cooccurrences = list(itertools.combinations(present_clusters, 2))
		if cooccurrences:
			cooccurrences = np.array(cooccurrences)
			cooccurrence_matrix[cooccurrences[:,0], cooccurrences[:,1]] += 1

	total = np.sum(cooccurrence_matrix)
	mis = [(np.sum(cooccurrence_matrix[i, :]) + k) / (total + k*n) for i in range(int(n))]
	mjs = [(np.sum(cooccurrence_matrix[:, j]) + k) / (total + k*n) for j in range(int(n))]
	pmi = np.zeros((n, n))
	for i in range(int(n)):
		for j in range(int(n)): 
			pmi[i,j] = calculate_pmi(cooccurrence_matrix, i, j, mis[i], mjs[j], total, k, n)


	np.save(path + root_filename + '_pmi_matrix_lem', pmi)
	pd.DataFrame({'chunks': all_strings}).to_csv(path + root_filename + '_pmi_text_in_order.csv')

	return pmi


# Vec functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ Vec functions
def custom(w, model):
	return np.array(model[w].strip().split(' ')).astype(float)

def cosine_similarity(v1, v2):
	return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def mean_weighted_vec(document: Document, word_indices, model, tfidf = None, tfidf_vectorizer = None, pmi = None, anchor_word = None, tfidf_pmi_weight = None):
	doc_index = document.get_index()
	word_vecs = []
	for word in document.tokens: # Duplicates are allowed.
		# Make sure that there are no spaces.
		word = word.strip()
		if word != '' and word != ' ' and word != anchor_word:
			try:
				embedding = np.array(model[word])
				if tfidf is not None and pmi is not None:
					w = tfidf_pmi_weight
					word_vecs.append(embedding * (tfidf[doc_index, tfidf_vectorizer.vocabulary_[word]]*(1 - w) + w*pmi[word_indices[anchor_word], word_indices[word]]))
				elif pmi is not None:
					word_vecs.append(embedding * pmi[word_indices[anchor_word], word_indices[word]])
				elif tfidf is not None:
					word_vecs.append(embedding * tfidf[doc_index, tfidf_vectorizer.vocabulary_[word]])
				else:
					word_vecs.append(embedding)
			except KeyError:
				pass
	if len(word_vecs) > 0:
		mean_vec = np.sum(word_vecs, axis = 0) / len(word_vecs)
		return mean_vec
	else:
		return np.array([np.nan]*len(model['dog']))

# Distance functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ Distance functions
def get_dist_between_docs(documents: list[Document], word_indices, model, tfidf, tfidf_vectorizer, pmi, anchor_word, tfidf_pmi_weight, preexisting = None):

	def get_weight(document: Document):
		if preexisting is None or document.get_vector_text() not in preexisting.keys():
			return mean_weighted_vec(document, word_indices, model, tfidf, tfidf_vectorizer, pmi, anchor_word, tfidf_pmi_weight)
		else:
			return preexisting[document.get_vector_text()]

	# For compatibility, this remains a dict.
	# To do, only calculate half of these and reuse them.
	doc_vecs = {document.get_vector_text(): get_weight(document) for document in documents}
	distances = np.zeros((len(documents), len(documents)))
	for d1 in documents:
		i = d1.get_index()
		vec_i = doc_vecs[d1.get_vector_text()]
		for d2 in documents:
			j = d2.get_index()
			vec_j = doc_vecs[d2.get_vector_text()]
			dist = 1 - cosine_similarity(vec_i, vec_j)
			distances[i,j] = dist
	return distances, doc_vecs

# Unweighted Pair Grouping With Arithmetic Mean
def get_upgma(ci: list[Document], cj: list[Document], doc_distances) -> float:
	ni, nj = len(ci), len(cj)
	distances = []
	for doc_i in ci:
		for doc_j in cj:
			dist = doc_distances[doc_i.get_index(), doc_j.get_index()]
			distances.append(dist)
	return 1/(ni*nj) * np.sum(distances)

def distance_within_cluster(ci: list[Document], doc_distances) -> list[float]:
	distances = []
	for dr in ci:
		for ds in ci:
			if dr != ds:
				dist = doc_distances[dr.get_index(), ds.get_index()]
				distances.append(dist)
	return distances

def generate_clusters(docs, doc_distances):
	all_clusters_seen = [[d] for d in docs]
	current_clusters = [[d] for d in docs] # Each document gets its own cluster
	siblings = []

	# print("Beginning clusters: ", current_clusters, '\n')

	while len(current_clusters) != 1:
		best_upgma = 1000000
		best_pair = None
		for ci in current_clusters:
			for cj in current_clusters:
				if ci != cj:
					upgma = get_upgma(ci, cj, doc_distances)
					if upgma < best_upgma:
						best_upgma = upgma
						best_pair = (ci, cj)
		# print("Closest two pairs: ", best_pair)
		siblings.append([best_pair[0], best_pair[1]])
		new_cluster = best_pair[0] + best_pair[1]
		all_clusters_seen.append(new_cluster)
		current_clusters.remove(best_pair[0])
		current_clusters.remove(best_pair[1])
		current_clusters.append(new_cluster)

		# print("New cluster: ", new_cluster)
		# print("Current clusters: ", current_clusters)
		# print("Total clusters seen: ", len(all_clusters_seen), "\n")

	return all_clusters_seen, siblings


# Quality measures --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Quality measures
def within(ci: list[Document], doc_distances) -> float:
	ni = len(ci)
	if ni > 1:
		distances = distance_within_cluster(ci, doc_distances)
		score = np.divide(1, (ni * (ni - 1)) )*np.sum(distances)
	else:
		score = np.nan # No within distance for a single document cluster
	return score

def between(ci: list[Document], clusters: list[list[Document]], doc_count: int, doc_distances) -> float:
	ni = len(ci)
	distances = []

	cj = []
	for cluster in clusters:
		for doc in cluster:
			if doc not in ci and doc not in cj:
				cj.append(doc)

	for dr in ci:
		for ds in cj:
			dist = doc_distances[dr.get_index(), ds.get_index()]
			distances.append(dist)

	if ni != doc_count:
		score = np.divide(1, (ni * (doc_count - ni))) * np.sum(distances)
	else:
		score = np.nan # No between distance if all documents are in the cluster
	return score

def neighborhood(ci: list[Document], doc_distances, siblings: list[list[Document]]) -> float:
	sib = None
	for sib_pair in siblings:
		if sib_pair[0] == ci:
			sib = sib_pair[1]
		elif sib_pair[1] == ci:
			sib = sib_pair[0]
	return get_upgma(ci, sib, doc_distances)


def growth(ci: list[Document], doc_distances, siblings: list[list[Document]]) -> float:
	for sib_pair in siblings:
		if sib_pair[0] == ci:
			cj = sib_pair[1]
		elif sib_pair[1] == ci:
			cj = sib_pair[0]

	d_between = get_upgma(ci, cj, doc_distances)

	w_sum_i = np.sum(distance_within_cluster(ci, doc_distances))
	w_sum_j = np.sum(distance_within_cluster(cj, doc_distances))
	ni, nj = len(ci), len(cj)

	if ni != 1 or nj != 1:
		within_children = (w_sum_i + w_sum_j) / (ni*(ni - 1) + nj*(nj - 1))
		g = d_between / within_children
		return g
	else:
		return np.nan



def get_composite(cluster):
	vecs = []
	for d in cluster:
		vecs.append(d.vector)
	return np.mean(vecs, axis = 0)

def betweenness(clusters, docs):
	meta_centroid = get_composite(docs)
	to_sum = []
	for ci in clusters:
		ni = len(ci)
		if ni > 0: # Don't run stuff for empty clusters
			dist = (1 - cosine_similarity(get_composite(ci), meta_centroid))
			to_sum.append(ni * (dist**2))
	return np.sum(to_sum)

def withinness(clusters):
	to_sum = []
	for ci in clusters:
		if len(ci) != 0:
			centroid = get_composite(ci)
			for di in ci:
				dist = (1 - cosine_similarity(di.vector, centroid))
				to_sum.append((dist**2))
		else:
			to_sum.append(0.0)
	return np.sum(to_sum)


def quality_scores(clusters: list[list[Document]], siblings: list[list[list[Document]]] , docs: list[Document], doc_distances) -> list[tuple[float, list[Document]]]:
	within_scores = np.array([within(ci, doc_distances) for ci in clusters])
	between_scores = np.array([between(ci, clusters, len(docs), doc_distances) for ci in clusters])
	neighborhood_scores = np.array([neighborhood(ci, doc_distances, siblings) if len(ci) != len(docs) else np.nan for ci in clusters])
	growth_scores = np.array([growth(ci, doc_distances, siblings) if len(ci) != len(docs) else np.nan for ci in clusters])

	w_quality = 1/within_scores
	wb_quality = between_scores/within_scores
	wn_quality = neighborhood_scores/within_scores
	gw_quality = 1/(growth_scores*within_scores)
	gwb_quality = between_scores/(growth_scores*within_scores)
	gwn_quality = neighborhood_scores/(growth_scores*within_scores)


	sorted_w = sorted(((w_quality[i], c) for i, c in enumerate(clusters) if not np.isnan(w_quality[i]) ), reverse = True)
	sorted_wb = sorted(((wb_quality[i], c) for i, c in enumerate(clusters) if not np.isnan(wb_quality[i])), reverse = True)
	sorted_wn = sorted(((wn_quality[i], c) for i, c in enumerate(clusters) if not np.isnan(wn_quality[i])), reverse = True)
	sorted_gw = sorted(((gw_quality[i], c) for i, c in enumerate(clusters) if not np.isnan(gw_quality[i])), reverse = True)
	sorted_gwb = sorted(((gwb_quality[i], c) for i, c in enumerate(clusters) if not np.isnan(gwb_quality[i])), reverse = True)
	sorted_gwn = sorted(((gwn_quality[i], c) for i, c in enumerate(clusters) if not np.isnan(gwn_quality[i])), reverse = True)
	sorted_qualities = [sorted_w, sorted_wb, sorted_wn, sorted_gw, sorted_gwb, sorted_gwn]

	return sorted_qualities


def C_score(docs, clusters):
	n = len(docs)
	k = len(clusters)

	b = betweenness(clusters, docs)
	w = withinness(clusters)

	# print("Num docs: ", n, ", num clusters: ", k, ", betweenness: ", b, "withinness: ", w)
	if k > 1 and w != 0.0:
		return (b * (n - k)) / (w * (k - 1))
	else:
		return np.nan # Don't want a single cluster


# SOFT KMEANS -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- SOFT KMEANS
# -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- 
# SOFT KMEANS -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- SOFT KMEANS
# There is no need to calculate any differences if j is out of the interesting range.
# There is no need to calculate extra differences if any one of them is at or above the threshold.
def check_convergence(centroids, last_centroids, j):
	diffs = []
	for i, centroid in enumerate(centroids):
		diffs.append(np.mean(centroid - last_centroids[i]))
	if max(diffs) < 0.00001 or j > 100:
		return True
	else:
		return False




# SURDEANU 2005 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- SURDEANU 2005
# -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- -------- ******* --------- 
# SURDEANU 2005 -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- SURDEANU 2005

# Generate models -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Generate models
def gamma_slide(docs, sorted_tuples, modified_clusters = None):
	scores, clusters = [], []
	len_docs = len(docs)
	len_clusters = len(sorted_tuples)

	for score_tuple in sorted_tuples:
		score, cluster = score_tuple[0], score_tuple[1]
		scores.append(score)
		clusters.append(cluster)

	last_C, last_tuple = -100000, None
	current_C = 0, None

	for i in range(len_clusters - 1):

		if i == 0:
			clusters_g, scores_g = clusters, scores
		else:
			clusters_g, scores_g = clusters[:-i], scores[:-i]

		# Of those clusters, remove clusters that are part of higher-ranked clusters
		to_remove = []
		for i, ci in enumerate(clusters_g):
			for j, cj in enumerate(clusters_g):
				if set([c.stripped for c in ci]).issubset([c.stripped for c in cj]) and ci != cj and scores_g[i] < scores_g[j] and ci not in to_remove:
					to_remove.append(ci)
		clusters_g = list(clusters_g)
		[clusters_g.remove(l) for l in to_remove]

		# Here's where you add the seed clusters to every cluster configuration
		if modified_clusters:
			clusters_g = modified_clusters + clusters_g

		gamma = len(list(set([c.stripped for c in list(itertools.chain.from_iterable(clusters_g))])))/len_docs

		current_C = C_score(docs, clusters_g)
		
		# check if C_score is less than last C_score, if so, take the last C_score (local maximum)
		if current_C < last_C:
			return last_tuple
		else:
			last_C = current_C
			last_tuple = (gamma, clusters_g, current_C)

	return last_tuple


def get_best_initial_model(docs, sorted_qualities, quality_names, modified_clusters = None):
	best_model, best_score = None, 0
	for i, q in enumerate(sorted_qualities): # There are six quality measures
		quality = quality_names[i]
		model_tuple = gamma_slide(docs, q, modified_clusters)
		current_score, current_model = model_tuple[2], (quality, model_tuple[0], model_tuple[1])

		if current_score > best_score:
			best_model, best_score = current_model, current_score

	return best_model



def get_best_initial_model_k(k: int, docs: list[Document], doc_distances, sorted_qualities: list[tuple[float, list[Document]]],
		quality_names: list[str], allowed_seed_size: float = 0.05, modified_clusters = None) -> tuple[str, float, list[list[Document]]]:
	score_tuples: tuple[float, list[Document]] = sorted_qualities[quality_names.index('gw')]
	len_docs = len(docs)
	# Re-calculate score to include betweenness with modified clusters and re-sort
	if modified_clusters:
		new_tuples = []
		for gw, cluster in score_tuples:
			b = between(cluster, modified_clusters, len_docs, doc_distances)
			gwb = b*gw
			new_tuples.append((gwb, cluster))
		score_tuples = sorted(new_tuples, reverse = True)
	
	all_included_docs = []
	allowed_clusters = []

	smallest_seed_size = np.min([len(score_tuple[1])/len_docs for score_tuple in score_tuples]) # Go through once to figure out the smallest seed_size
	if smallest_seed_size > allowed_seed_size:
		allowed_seed_size = smallest_seed_size + 0.1 # Just to give us some wiggle room

	for score_tuple in score_tuples:
		_score, cluster = score_tuple[0], score_tuple[1]
		seed_size = len(cluster)/len_docs
		if len(allowed_clusters) < k:
			if seed_size <= allowed_seed_size: # K should be number of new clusters generated, ignoring existing modified clusters (because we might want to set k elsewhere or allow the user to set it)
				allowed_clusters.append(cluster)
				all_included_docs += cluster
		else:
			break

	return 'gw', len(all_included_docs)/len_docs, modified_clusters + allowed_clusters

# Expectation maximization ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Expectation maximization

# ps = probabilities
def calculate_ps_cat(doc_indices, categories, ps_cat_given_doc, q, n):
	ps_cat = []
	for c, _cat in enumerate(categories):
		to_sum = ps_cat_given_doc[doc_indices, c]
		stat = (1 + np.sum(to_sum))/(q + n)
		ps_cat.append(stat)
	return ps_cat

# tfps = term frequency probabilities
def calculate_tfps(doc_indices, categories, words, words_in_docs, counts, ps_cat_given_doc, word_vectorizer):
	tfps = np.zeros(len(categories))
	for c, _cat in enumerate(categories):
		c_sum = 0
		for w, word in enumerate(words):
			if word in words_in_docs: # Should just have this precalculated and an index checker like you handle docs
				counts_by_doc = counts[doc_indices, word_vectorizer.vocabulary_[word]]
				ps_by_doc = ps_cat_given_doc[doc_indices, c]
				c_sum += np.sum(counts_by_doc * ps_by_doc)
		tfps[c] = c_sum
	return tfps

# ps = probabilities
def calculate_ps_word_given_cat(doc_indices, categories, words, word_indices, words_in_docs, counts, ps_cat_given_doc, word_vectorizer, v, tfps): # Keys are words, values are lists where each element is the probability given the category at that index
	ps_word_given_cat = np.zeros((len(categories), len(words)))
	for w, word in enumerate(words):
		if word in words_in_docs: # Should just have this precalculated and an index checker like you handle docs
			for c, _cat in enumerate(categories):
				counts_by_doc = counts[doc_indices, word_vectorizer.vocabulary_[word]]
				ps_by_doc = ps_cat_given_doc[doc_indices, c]
				numerator = 1 + np.sum(counts_by_doc * ps_by_doc)
				denominator = tfps[c] + v
				p_word_given_cat = numerator/denominator
				ps_word_given_cat[c, word_indices[word]] = p_word_given_cat

	return ps_word_given_cat


def calculate_soft_threshold(ps_cat_given_doc):
	flat = sorted(np.ndarray.flatten(ps_cat_given_doc))
	diff = np.abs(np.diff(flat))
	big_gap = np.where(diff == max(diff))[0][0]
	threshold = flat[big_gap + 1]
	return threshold

def pick_soft_labels(p_cat_given_doc, threshold, categories, doc_to_seeded):
	p = np.array(p_cat_given_doc)
	possible_labels = np.array(range(len(categories)))
	labels = list(possible_labels[np.where(p > threshold)])
	return labels


def pick_single_label(p_cat_given_doc, rndgen):
	max_prob = max(p_cat_given_doc)
	pick_max = rndgen.choice([i for i, p in enumerate(p_cat_given_doc) if p == max_prob])
	return pick_max


def renormalize(p_cat_given_doc, seeded_categories):
	p_cat_given_doc[seeded_categories] = 0
	return p_cat_given_doc / np.sum(p_cat_given_doc)

def maximization(documents, doc_to_seeded, categories, ps_cat, ps_word_given_cat, word_indices):
	ps_cat_given_doc = np.zeros((len(documents), len(categories)))
	for d_index, d in enumerate(documents):
		if np.sum(doc_to_seeded[d_index, :]) == 0:
			p_cat_given_doc = []
			doc_words = d.tokens
			doc_word_indices = np.array([word_indices[w] for w in doc_words])
			for c, cat in enumerate(categories):
				p_cat = ps_cat[c] # Get the prob of this category
				to_multiply = ps_word_given_cat[c, doc_word_indices]
				numerator = p_cat * np.prod(to_multiply)

				to_sum = []
				for q, _ in enumerate(categories):
					p_cat_q = ps_cat[q]
					to_multiply = ps_word_given_cat[q, doc_word_indices]
					to_sum.append(p_cat_q * np.prod(to_multiply))
				denominator = np.sum(to_sum)

				p_cat_given_doc.append(numerator/denominator)

			ps_cat_given_doc[d_index] = p_cat_given_doc
		else:
			ps_cat_given_doc[d_index] = np.concatenate([np.nan_to_num(doc_to_seeded[d_index, :] / np.sum(doc_to_seeded[d_index, :])), np.zeros(len(categories) - doc_to_seeded.shape[1])])

	return ps_cat_given_doc


def run_expect_max(documents: list[Document], seeded_clusters: list[list[Document]], categories, words: list[str], word_indices: dict[str, int], words_in_docs: list[str],
		word_vectorizer, counts, rndgen, soft = False, num_loops = 5):

	ps_cat_given_doc = np.zeros((len(documents), len(categories)))

	q = len(categories)
	n = len(documents)
	v = len(words)

	doc_to_seeded = np.zeros((len(documents), len(seeded_clusters)))
	# Get initial labels and figure out which documents are user-assigned to which clusters
	for d_index, d in enumerate(documents):
		for c, cat in enumerate(categories):
			if d in cat:
				ps_cat_given_doc[d_index, c] = 1 # If the user has assigned to multiple categories, this will add up to more than one
		ps_cat_given_doc[d_index, :] = np.nan_to_num(ps_cat_given_doc[d_index, :] / np.sum(ps_cat_given_doc[d_index, :])) # So renormalize

		for s, sc in enumerate(seeded_clusters):
			if d in sc:
				doc_to_seeded[d_index, s] = 1

	doc_indices = list(range(len(documents)))

	for i in range(num_loops):
		n = len([l for l in ps_cat_given_doc if not (np.array(l) == 0).all()]) # Seeded documents stay zero always

		ps_cat = calculate_ps_cat(doc_indices, categories, ps_cat_given_doc, q, n)
		tfps = calculate_tfps(doc_indices, categories, words, words_in_docs, counts, ps_cat_given_doc, word_vectorizer)
		ps_word_given_cat = calculate_ps_word_given_cat(doc_indices, categories, words, word_indices, words_in_docs, counts, ps_cat_given_doc, word_vectorizer, v, tfps)

		ps_cat_given_doc = maximization(documents, doc_to_seeded, categories, ps_cat, ps_word_given_cat, word_indices)

	labels = []
	threshold = calculate_soft_threshold(ps_cat_given_doc)
	for i, pcd in enumerate(ps_cat_given_doc): # These are in the order of docs
		if np.sum(doc_to_seeded[i, :]) > 0:
			labels.append(list(np.where(doc_to_seeded[i, :] == 1.0)[0]))
		else:
			if soft:
				labels.append(pick_soft_labels(pcd, threshold, categories, doc_to_seeded)) # You need to override the label-picking because if the user puts the doc in too many categories, soft labeling won't preserve the choice.
			else:
				labels.append(pick_single_label(pcd, doc_to_seeded, rndgen))
	return labels




