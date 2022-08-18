import os, sys
import numpy as np
from numpy import inf
import pandas as pd
import json
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
import spacy
import time
import copy
import re
import random
import string
import itertools
# import matplotlib.pyplot as plt

path = '/Users/allegracohen/Documents/Postdoc/habitus/odin_project/grid/process_files/'


# Doc functions -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------Doc functions
def miniclean(text):
	remove_uni =  ''.join(["'" if ord(i) == 8217 else i for i in text])
	remove_uni = ''.join([i if ord(i) < 128 else ' ' for i in remove_uni])
	no_digits = ''.join([r for r in remove_uni if not r.isdigit()])
	cleaned = no_digits.lower().translate(str.maketrans(string.punctuation, ' '*len(string.punctuation))).strip()
	return cleaned

def clean_text(text, nlp, readable = False, allow_stopwords = False, lemmatize = False, synonym_book = None, too_common = []):

	stop = set(stopwords.words('english') + list(string.punctuation) + ['', ' ', '…', 'also'])

	conj = ['didn', ' t ', ' don ', ' won ', 'isn', ' i ', ' d ', ' ll ', 'doesn', 'wasn', 'wouldn', 'hasn', 'couldn']
	junk = [' pape ', ' dr ', ' fall ', '\x0c', '\n', '\t', 'e', 'g', 'etc'] + too_common
	# remove_uni =  [''.join(["'" if ord(i) == 8217 else i for i in s]) for s in corpus['sentence']]
	remove_uni = ''.join([i if ord(i) < 128 else ' ' for i in text])
	if readable:
		remove_uni = re.sub(' +', ' ', remove_uni)
		remove_uni = re.sub('\n', '', remove_uni)
		remove_uni = re.sub('\t', '', remove_uni)
		remove_uni = re.sub('~', '', remove_uni)
		remove_uni = re.sub('/', '', remove_uni)
		return remove_uni
	remove_uni = ''.join([i if ord(i) < 128 else ' ' for i in remove_uni])
	no_digits = ''.join([r for r in remove_uni if not r.isdigit()])
	cleaned = no_digits.lower().translate(str.maketrans(string.punctuation, ' '*len(string.punctuation))).strip()
	for c in conj:
		cleaned = cleaned.replace(c, ' ')
	if not allow_stopwords:
		if lemmatize:
			cleaned = ' '.join(w.lemma_ for w in nlp(cleaned) if str(w) not in stop and str(w) not in junk)
		else:
			cleaned = ' '.join(w for w in cleaned.split(' ') if w not in stop and w not in junk)
	cleaned = re.sub(' +', ' ', cleaned)

	if synonym_book:
		for word_list in synonym_book:
			head_word = word_list[0]
			for word in word_list[1:]:
				cleaned = re.sub(r"\b%s\b" % word, head_word, cleaned)

	return cleaned


def find_relevant_docs(docs, anchor_word, reset_index = False):
	relevant = []
	doc_index_dict = {}
	doc_indices, nonreset = [], []
	j = 0
	for i, doc in enumerate(docs):
		# if len(relevant) < 10: # -----------------------------------------> !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ******* !!!!!!!!!!!!!!!!! 
		if type(doc) == str:
			doc_words = word_tokenize(doc)
			for word in doc_words:
				if (anchor_word in word and doc not in relevant) or (anchor_word == 'all_words' and doc not in relevant):
					relevant.append(doc)
					if reset_index:
						doc_index_dict[doc] = j
						doc_indices.append(j)
					else:
						doc_index_dict[doc] = i
						doc_indices.append(i)
					nonreset.append(i)
					j += 1
	return [relevant, doc_index_dict, doc_indices, nonreset]


def get_row_to_docs(filename):
	row_to_docs = {}
	df = pd.read_csv(path + filename)
	rows = df[['readable', 'other', 'proportions', 'processes', 'decisions', 'conditions', 'causes']]
	for r in ['other', 'proportions', 'processes', 'decisions', 'conditions', 'causes']:
		row_to_docs[r] = [d for d in list(df.loc[df[r] == 1, 'readable'])]
	return row_to_docs


# PMI functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ PMI functions
def calculate_pmi(cooccurrence_matrix, i, j, mi, mj, total, k, n):
	joint = np.true_divide((cooccurrence_matrix[i,j] + k), (total + k*n))
	frac = np.true_divide(joint, (mi * mj))
	pmi = np.log(frac)
	return pmi

def get_pmi(sentences, all_strings, k, file_suffix, window = 1):
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


	np.save(path + 'pmi_matrix' + file_suffix, pmi)
	pd.DataFrame({'chunks': all_strings}).to_csv(path + 'pmi_text_in_order' + file_suffix + '.csv')


# Vec functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ Vec functions
def custom(w):
	return np.array(model[w].strip().split(' ')).astype(float)

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


def mean_weighted_vec(text, doc_index_dict, word_indices, model, tfidf = None, tfidf_vectorizer = None, pmi = None, anchor_word = None, tfidf_pmi_weight = None):
	doc_index = doc_index_dict[text]
	wvecs = []
	for word in text.split(' '):
		word = word.strip()
		if word != '' and word != ' ' and word != anchor_word:
			try:
				embedding = np.array(model[word])
				if tfidf is not None and pmi is not None:
					w = tfidf_pmi_weight
					wvecs.append(embedding * (tfidf[doc_index, tfidf_vectorizer.vocabulary_[word]]*(1 - w) + w*pmi[word_indices[anchor_word], word_indices[word]]))
				elif pmi is not None:
					wvecs.append(embedding * pmi[word_indices[anchor_word], word_indices[word]])
				elif tfidf is not None:
					wvecs.append(embedding * tfidf[doc_index, tfidf_vectorizer.vocabulary_[word]])
				else:
					wvecs.append(embedding)
			except KeyError:
				pass
	if len(wvecs) > 0:
		mvec = np.sum(wvecs, axis = 0) / len(wvecs)
		return mvec
	else:
		return np.array([np.nan]*len(model['dog']))

# Distance functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ Distance functions
def get_dist_btn_docs(docs, doc_index_dict, word_indices, model, tfidf, tfidf_vectorizer, pmi, anchor_word, tfidf_pmi_weight):
	distances = np.zeros((len(docs), len(docs)))
	doc_vecs = {}
	for d1 in docs:
		i = doc_index_dict[d1]
		for d2 in docs:
			j = doc_index_dict[d2]
			vec_i, vec_j = mean_weighted_vec(d1, doc_index_dict, word_indices, model, tfidf, tfidf_vectorizer, pmi, anchor_word, tfidf_pmi_weight), mean_weighted_vec(d2, doc_index_dict, word_indices, model, tfidf, tfidf_vectorizer, pmi, anchor_word, tfidf_pmi_weight)
			doc_vecs[d1] = vec_i # Yup, this is redundant, needs fixing
			doc_vecs[d2] = vec_j
			dist = 1 - cosine_similarity(vec_i, vec_j)
			distances[i,j] = dist
	return [distances, doc_vecs]



def get_upgma(ci, cj, doc_distances, doc_index_dict):
	ni, nj = len(ci), len(cj)
	distances = []
	for doc_i in ci:
		for doc_j in cj:
			di, dj = doc_index_dict[doc_i], doc_index_dict[doc_j]
			dist = doc_distances[di, dj]
			distances.append(dist)
	return 1/(ni*nj) * np.sum(distances)


def distance_within_cluster(ci, doc_distances, doc_index_dict):
	distances = []
	for dr in ci:
		for ds in ci:
			if dr != ds:
				di, dj = doc_index_dict[dr], doc_index_dict[ds]
				dist = doc_distances[di, dj]
				distances.append(dist)
	return distances


def generate_clusters(docs, doc_distances, doc_index_dict):
	all_clusters_seen = [[d] for d in docs.copy()]
	current_clusters = [[d] for d in docs.copy()] # Each document gets its own cluster
	siblings = []

	# print("Beginning clusters: ", current_clusters, '\n')

	while len(current_clusters) != 1:
		best_upgma = 1000000
		best_pair = None
		for ci in current_clusters:
			for cj in current_clusters:
				if ci != cj:
					upgma = get_upgma(ci, cj, doc_distances, doc_index_dict)
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

	return [all_clusters_seen, siblings]


# Quality measures --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Quality measures
def within(ci, doc_distances, doc_index_dict):
	ni = len(ci)
	
	distances = distance_within_cluster(ci, doc_distances, doc_index_dict)

	score = np.divide(1, (ni * (ni - 1)) )*np.sum(distances)
	if np.isinf(score):
		return np.nan
	else:
		return score

def between(ci, clusters, docs, doc_distances, doc_index_dict):
	ni = len(ci)
	distances = []

	cj = []
	for cluster in clusters:
		for doc in cluster:
			if doc not in ci:
				cj.append(doc)

	for dr in ci:
		for ds in cj:
			di, dj = doc_index_dict[dr], doc_index_dict[ds]
			dist = doc_distances[di, dj]
			distances.append(dist)

	score = np.divide(1, (ni * (len(docs) - ni)) ) *np.sum(distances)
	if np.isinf(score):
		return np.nan
	else:
		return score

def neighborhood(ci, doc_distances, siblings, doc_index_dict):
	sib = None
	for sib_pair in siblings:
		if sib_pair[0] == ci:
			sib = sib_pair[1]
		elif sib_pair[1] == ci:
			sib = sib_pair[0]
	return get_upgma(ci, sib, doc_distances, doc_index_dict)


def growth(ci, doc_distances, siblings, doc_index_dict):
	for sib_pair in siblings:
		if sib_pair[0] == ci:
			cj = sib_pair[1]
		elif sib_pair[1] == ci:
			cj = sib_pair[0]

	d_between = get_upgma(ci, cj, doc_distances, doc_index_dict)

	w_sum_i = np.sum(distance_within_cluster(ci, doc_distances, doc_index_dict))
	w_sum_j = np.sum(distance_within_cluster(cj, doc_distances, doc_index_dict))
	ni, nj = len(ci), len(cj)
	within_children = (w_sum_i + w_sum_j) / (ni*(ni - 1) + nj*(nj - 1))

	g = d_between / within_children

	if np.isinf(g):
		return np.nan

	return g



def get_composite(cluster, doc_vecs):
	vecs = []
	for d in cluster:
		vecs.append(doc_vecs[d])
	return np.mean(vecs, axis = 0)

def betweenness(clusters, docs, doc_vecs):
	meta_centroid = get_composite(docs, doc_vecs)
	to_sum = []
	for ci in clusters:
		ni = len(ci)
		dist = (1 - cosine_similarity(get_composite(ci, doc_vecs), meta_centroid))
		to_sum.append(ni * (dist**2))
	return np.sum(to_sum)

def withinness(clusters, doc_vecs):
	to_sum = []
	for ci in clusters:
		centroid = get_composite(ci, doc_vecs)
		for di in ci:
			dist = (1 - cosine_similarity(doc_vecs[di], centroid))
			to_sum.append((dist**2))
	return np.sum(to_sum)


def quality_scores(clusters, siblings, docs, doc_distances, doc_index_dict):
	within_scores = np.array([within(ci, doc_distances, doc_index_dict) for ci in clusters])
	between_scores = np.array([between(ci, clusters, docs, doc_distances, doc_index_dict) for ci in clusters])
	neighborhood_scores = np.array([neighborhood(ci, doc_distances, siblings, doc_index_dict) if len(ci) != len(docs) else np.nan for ci in clusters])
	growth_scores = np.array([growth(ci, doc_distances, siblings, doc_index_dict) if len(ci) != len(docs) else np.nan for ci in clusters])

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


def C_score(docs, clusters, doc_vecs):
	n = len(docs)
	k = len(clusters)

	b = betweenness(clusters, docs, doc_vecs)
	w = withinness(clusters, doc_vecs)

	# print("Num docs: ", n, ", num clusters: ", k, ", betweenness: ", b, "withinness: ", w)

	return (b * (n - k))/(w * (k - 1))

# Generate models -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Generate models
def gamma_slide(docs, sorted_tuples, doc_vecs, modified_clusters = None):
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
				if set(ci).issubset(cj) and ci != cj and scores_g[i] < scores_g[j] and ci not in to_remove:
					to_remove.append(ci)
		clusters_g = list(clusters_g)
		[clusters_g.remove(l) for l in to_remove]

		# Here's where you add the seed clusters to every cluster configuration
		if modified_clusters:
			clusters_g = modified_clusters + clusters_g

		gamma = len(list(set(list(itertools.chain.from_iterable(clusters_g)))))/len_docs

		current_C = C_score(docs, clusters_g, doc_vecs)
		# print("Gamma: ", gamma, ", score: ", current_C, "\n")
		
		# check if C_score is less than last C_score, if so, take the last C_score (local maximum)
		if current_C < last_C:
			return last_tuple
		else:
			last_C = current_C
			last_tuple = (gamma, clusters_g, current_C)

	return (gamma, clusters_g, current_C)


def get_best_initial_model(docs, doc_vecs, sorted_qualities, quality_names, modified_clusters = None):
	best_model, best_score = None, 0
	for i, q in enumerate(sorted_qualities): # There are six quality measures
		quality = quality_names[i]
		model_tuple = gamma_slide(docs, q, doc_vecs, modified_clusters)
		current_score, current_model = model_tuple[2], (quality, model_tuple[0], model_tuple[1])

		if current_score > best_score:
			best_model, best_score = current_model, current_score

	return best_model



def get_best_initial_model_k(k, docs, doc_vecs, doc_distances, doc_index_dict, sorted_qualities, quality_names, allowed_seed_size = 0.05, modified_clusters = None):
	score_tuples = sorted_qualities[quality_names.index('gw')]

	# Re-calculate score to include betweenness with modified clusters and re-sort
	if modified_clusters:
		new_tuples = []
		for gw, cluster in score_tuples:
			b = between(cluster, modified_clusters, docs, doc_distances, doc_index_dict)
			gwb = b*gw
			new_tuples.append((gwb, cluster))
		score_tuples = sorted(new_tuples, reverse = True)

	len_docs = len(docs)
	
	all_included_docs = []
	allowed_clusters = []
	for score_tuple in score_tuples:
		score, cluster = score_tuple[0], score_tuple[1]
		seed_size = len(cluster)/len_docs
		if len(allowed_clusters) < k:
			if seed_size < allowed_seed_size: # K should be number of new clusters generated, ignoring existing modified clusters (because we might want to set k elsewhere or allow the user to set it)
				allowed_clusters.append(cluster)
				all_included_docs += cluster
		else:
			break

	return ('gw', len(all_included_docs)/len_docs, modified_clusters + allowed_clusters)

		



# Expectation maximization ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Expectation maximization

def calculate_ps_cat(docs, categories, ps_cat_given_doc, doc_indices, q, n):
	ps_cat = []
	for c, cat in enumerate(categories):
		to_sum = ps_cat_given_doc[doc_indices, c]
		stat = (1 + np.sum(to_sum))/(q + n)
		ps_cat.append(stat)
	return ps_cat


def calculate_tfps(docs, doc_indices, categories, words, words_in_docs, counts, ps_cat_given_doc, word_vectorizer):
	tfps = np.zeros(len(categories))
	for c, cat in enumerate(categories):
		c_sum = 0
		for w, word in enumerate(words):
			if word in words_in_docs: # Should just have this precalculated and an index checker like you handle docs
				counts_by_doc = counts[doc_indices, word_vectorizer.vocabulary_[word]]
				ps_by_doc = ps_cat_given_doc[doc_indices, c]
				c_sum += np.sum(counts_by_doc * ps_by_doc)
		tfps[c] = c_sum
	return tfps

def calculate_ps_word_given_cat(docs, doc_indices, categories, words, word_indices, words_in_docs, counts, ps_cat_given_doc, word_vectorizer, v, tfps): # Keys are words, values are lists where each element is the probability given the category at that index
	ps_word_given_cat = np.zeros((len(categories), len(words)))
	for w, word in enumerate(words):
		if word in words_in_docs: # Should just have this precalculated and an index checker like you handle docs
			for c, cat in enumerate(categories):
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
	# first_big_gap = np.where(diff > np.quantile(diff, q = 0.75))[0][0]
	big_gap = np.where(diff == max(diff))[0][0]
	threshold = flat[big_gap + 1]
	# print("   ~~~ Soft clustering threshold is now: ", threshold, " ~~~")
	# plt.hist(np.ndarray.flatten(ps_cat_given_doc), bins = 100)
	# plt.show()
	return threshold

def pick_soft_labels(p_cat_given_doc, threshold, categories, doc_to_seeded):
	p = np.array(p_cat_given_doc)
	possible_labels = np.array(range(len(categories)))
	labels = list(possible_labels[np.where(p > threshold)])
	return labels


def pick_single_label(p_cat_given_doc):
	max_prob = max(p_cat_given_doc)
	pick_max = random.choice([i for i, p in enumerate(p_cat_given_doc) if p == max_prob])
	return pick_max


def renormalize(p_cat_given_doc):
	p_cat_given_doc[seeded_categories] = 0
	return p_cat_given_doc / np.sum(p_cat_given_doc)

def maximization(docs, doc_index_dict, doc_to_seeded, categories, ps_cat, ps_word_given_cat, word_indices):
	ps_cat_given_doc = np.zeros((len(docs), len(categories)))
	for doc in docs:
		d = doc_index_dict[doc]
		if np.sum(doc_to_seeded[d, :]) == 0:
			p_cat_given_doc = []
			doc_words = word_tokenize(doc)
			doc_word_indices = np.array([word_indices[w] for w in doc_words])
			for c, cat in enumerate(categories):
				p_cat = ps_cat[c] # Get the prob of this category
				to_multiply = ps_word_given_cat[c, doc_word_indices]
				numerator = p_cat * np.prod(to_multiply)

				to_sum = []
				for q, catq in enumerate(categories):
					p_cat_q = ps_cat[q]
					to_multiply = ps_word_given_cat[q, doc_word_indices]
					to_sum.append(p_cat_q * np.prod(to_multiply))
				denominator = np.sum(to_sum)

				p_cat_given_doc.append(numerator/denominator)

			ps_cat_given_doc[d] = p_cat_given_doc
		else:
			ps_cat_given_doc[d] = np.concatenate([np.nan_to_num(doc_to_seeded[d, :] / np.sum(doc_to_seeded[d, :])), np.zeros(len(categories) - doc_to_seeded.shape[1])])

	return ps_cat_given_doc


def run_expect_max(docs, seeded_clusters, categories, words, word_indices, words_in_docs, word_vectorizer, counts, doc_index_dict, doc_indices, ps_cat_given_doc, q, n, v, soft = False, num_loops = 5):

	doc_to_seeded = np.zeros((len(docs), len(seeded_clusters)))
	# Get initial labels and figure out which documents are user-assigned to which clusters
	for doc in docs:
		d = doc_index_dict[doc]	
		for c, cat in enumerate(categories):
			if doc in cat:
				ps_cat_given_doc[d, c] = 1 # If the user has assigned to multiple categories, this will add up to more than one
		ps_cat_given_doc[d, :] = np.nan_to_num(ps_cat_given_doc[d, :] / np.sum(ps_cat_given_doc[d, :])) # So renormalize

		for s, sc in enumerate(seeded_clusters):
			if doc in sc:
				doc_to_seeded[d, s] = 1

	last_pcat = np.zeros(len(categories))
	for i in range(num_loops):
		t = time.time()
		n = len([l for l in ps_cat_given_doc if not (np.array(l) == 0).all()]) # Seeded documents stay zero always

		ps_cat = calculate_ps_cat(docs, categories, ps_cat_given_doc, doc_indices, q, n)
		tfps = calculate_tfps(docs, doc_indices, categories, words, words_in_docs, counts, ps_cat_given_doc, word_vectorizer)
		ps_word_given_cat = calculate_ps_word_given_cat(docs, doc_indices, categories, words, word_indices, words_in_docs, counts, ps_cat_given_doc, word_vectorizer, v, tfps)

		ps_cat_given_doc = maximization(docs, doc_index_dict, doc_to_seeded, categories, ps_cat, ps_word_given_cat, word_indices)

		labels = []
		threshold = calculate_soft_threshold(ps_cat_given_doc)
		for i, pcd in enumerate(ps_cat_given_doc): # These are in the order of docs
			if np.sum(doc_to_seeded[i, :]) > 0:
				labels.append(list(np.where(doc_to_seeded[i, :] == 1.0)[0]))
			else:
				if soft:
					labels.append(pick_soft_labels(pcd, threshold, categories, doc_to_seeded)) # You need to override the label-picking because if the user puts the doc in too many categories, soft labeling won't preserve the choice.
				else:
					labels.append(pick_single_label(pcd, doc_to_seeded))
		# print(labels)
	return labels


# Column naming -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- Column naming

def get_cluster_name(n, docs, doc_index_dict, tfidf_vectorizer, tfidf, pmi, anchor_word, anchor_index, tfidf_pmi_weight):
	word_tfidf = {}
	for doc in docs:
		di = doc_index_dict[doc]
		for word in word_tokenize(doc):
			val = tfidf[di, tfidf_vectorizer.vocabulary_[word]]
			if word in word_tfidf.keys():
				word_tfidf[word] += val
			else:
				word_tfidf[word] = [val]



	all_words = list(set(word_tokenize(' '.join(docs))))
	w = tfidf_pmi_weight
	if pmi is not None:
		top_words = sorted((((pmi[i, anchor_index]*w + (1-w)*np.mean(word_tfidf[word])), word)  for i, word in enumerate(all_words) if not np.isnan(pmi[i, anchor_index]) and word != anchor_word), reverse = True)[0:n]
	else:
		top_words = sorted((((np.mean(word_tfidf[word])), word)  for i, word in enumerate(all_words) if not np.isnan(pmi[i, anchor_index]) and word != anchor_word), reverse = True)[0:n]
	return top_words












