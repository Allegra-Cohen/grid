import os, sys
import numpy as np
from numpy import inf
import pandas as pd
import copy
import string

sys.path.append("/Users/allegracohen/Documents/Postdoc/habitus/odin_project/grid/")
path = '/Users/allegracohen/Documents/Postdoc/habitus/odin_project/grid/process_files'

from grid_functions import *

class Grid():
	def __init__(self, anchor, k, corpus, reclean, reprocess, synonym_book, too_common):

		print("\n\n\nInitializing a Grid for anchor: ", anchor)

		self.k = k

		self.row_to_docs = get_row_to_docs("row_labels_horticulture.csv") # "row_labels.csv"

		self.reprocess = reprocess
		self.synonym_book = synonym_book
		self.too_common = too_common
		self.trash = []

		self.all_clusters = []

		self.word_vectorizer = CountVectorizer(analyzer = 'word', tokenizer = word_tokenize)
		self.tfidf_vectorizer = TfidfVectorizer(tokenizer = word_tokenize)

		self.counts = None
		self.words = None
		self.tfidf = None
		self.pmi = None
		self.doc_distances = None
		self.doc_vecs = None

		self.anchor = anchor

		# Clean the corpus
		if reclean:
			nlp = spacy.load("en_core_web_sm")
			stripped_corpus = list(corpus['sentence'].apply(clean_text, args = (nlp, False, False, True, self.synonym_book, self.too_common)).reset_index()['sentence'])
			readable_corpus = list(corpus['sentence'].apply(clean_text, args = (nlp, True, False, False, None)).reset_index()['sentence'])
			pd.DataFrame({'stripped': stripped_corpus, "readable": readable_corpus}).to_csv(path + 'cleaned_docs.csv')
		else:
			read_docs = pd.read_csv(path + 'cleaned_docs.csv')
			stripped_corpus, readable_corpus = list(read_docs['stripped']), list(read_docs['readable'])

		self.docs, self.doc_index_dict, self.doc_indices, self.indices_in_corpus = find_relevant_docs(stripped_corpus, self.anchor, reset_index = True)
		self.readable_docs = list(np.array(readable_corpus)[self.indices_in_corpus])
		self.stripped_corpus = stripped_corpus # This is for resetting self.indices_in_corpus, which, ok, you don't really need

		self.clicked_sentences = self.readable_docs #[]
		self.clicked_cluster = 0 # None
		self.clicked_row = 'other'

		self.copy_on = False


	def counts_and_tfidf(self):
		self.counts = self.word_vectorizer.fit_transform(self.docs).toarray()
		self.words = self.word_vectorizer.get_feature_names_out()

		self.word_indices = {k: i for i, k in enumerate(list(self.words))}
		self.words_in_docs = list(set(word_tokenize(' '.join(self.docs))))
		self.anchor_index = self.word_indices[self.anchor]

		self.tfidf = self.tfidf_vectorizer.fit_transform(self.docs)

	def pmi_and_vecs(self, tfidf_pmi_weight_vecs):
		if self.reprocess:
			print("Calculating PMI matrix ... \n")
			self.pmi = get_pmi(self.docs, self.words, k = 0, file_suffix = '_lem', window = 1)  
		self.pmi = np.load(path + 'pmi_matrix_lem.npy')
		self.pmi[np.isnan(self.pmi)] = 0
		self.pmi[self.pmi == np.inf] = 0
		self.pmi[self.pmi == -1*np.inf] = 0

		if self.reprocess:
			print("Calculating vector embeddings ... \n ")
			import gensim.downloader as api                                   
			model = api.load('word2vec-google-news-300')                      
			distance_data = get_dist_btn_docs(self.docs, self.doc_index_dict, self.word_indices, model, self.tfidf, self.tfidf_vectorizer, self.pmi, self.anchor, tfidf_pmi_weight_vecs)
			doc_distances, doc_vecs = distance_data[0], distance_data[1]      
			np.save(path + 'doc_distances_lem.npy', doc_distances)            
			with open(path + 'doc_vecs_lem.json', 'w') as file:               
				json.dump({k: v.tolist() for k, v in doc_vecs.items()}, file) 

		self.doc_distances = np.load(path + 'doc_distances_lem.npy')
		with open(path + 'doc_vecs_lem.json', 'r') as file:
			doc_vecs = json.load(file)
		self.doc_vecs = {k: np.array(v) for k, v in doc_vecs.items()}


	def process_documents(self, tfidf_pmi_weight): # This should only need doing once
		self.counts_and_tfidf()
		self.pmi_and_vecs(tfidf_pmi_weight)




	# Cluster stuff ================================================================================================================================================================
	def generate_clusters_surdeanu2005(self):

		seeded_doc_lists = [c.user_added for c in self.all_clusters if c.type == 'seeded'] # You only want to consider user-added documents as seeds. (Note: I don't know how this affects scoring in gamma_slide.)
		modified_clusters = [c.doc_list for c in self.all_clusters if c.type == 'frozen'] + seeded_doc_lists # These are the clusters that should influence the machine-generated clusters

		hierarchical_clusters = generate_clusters(self.docs, self.doc_distances, self.doc_index_dict) # Initial clusters using hierarchical clustering
		clusters, siblings = hierarchical_clusters[0], hierarchical_clusters[1]
		sorted_qualities = quality_scores(clusters, siblings, self.docs, self.doc_distances, self.doc_index_dict)
		quality_names = ['w', 'wb', 'wn', 'gw', 'gwb', 'gwn']

		if self.k is None:
			best_init = get_best_initial_model(self.docs, self.doc_vecs, sorted_qualities, quality_names, modified_clusters = modified_clusters) # Seed clusters are added here ...
		else:
			if len(modified_clusters) > self.k:
				k = 2 # If you have more clusters than k, just add a couple more each time.
			else:
				k = self.k - len(modified_clusters) # Always keep the right number
			best_init = get_best_initial_model_k(k, self.docs, self.doc_vecs, self.doc_distances, self.doc_index_dict, sorted_qualities, quality_names, allowed_seed_size = 0.05, modified_clusters = modified_clusters) # Seed clusters are added here ...

		# Now the best initial model will have frozen and seeded clusters in the first N positions of the list.
		categories = best_init[2]
		categories = [cat for cat in categories if cat not in [c.doc_list for c in self.all_clusters if c.type == 'frozen']] # Remove frozen clusters from the initial model because they shouldn't be added to.
		ps_cat_given_doc = np.zeros((len(self.docs), len(categories)))
		q = len(categories)
		n = len(self.docs)
		v = len(self.words)

		labels = run_expect_max(self.docs, seeded_doc_lists, categories, self.words, self.word_indices, self.words_in_docs, self.word_vectorizer,  # I agree this is egregious. Would be better to have a clustering alg class.
								self.counts, self.doc_index_dict, self.doc_indices, ps_cat_given_doc, q, n, v, soft = 0.2, num_loops = 10)

		# Again the first N category digits will correspond to seeded_clusters (so if there are 2 seeded clusters, categories 0 and 1 will be those)
		return [labels, q]



	def generate_grid(self, tfidf_pmi_weight, k = None, verbal = True):
		print("K: ", k)
		self.k = k

		# This checks if you've initialized your Grid yet
		if self.all_clusters == []:
			print("New grid -- processing documents ... ")
			self.process_documents(tfidf_pmi_weight)

		print("Generating grid ... ")

		labels, num_labels = self.generate_clusters_surdeanu2005() # This returns cluster labels for each document. The first N category digits will correspond to the seeded_clusters.
		print([c.type for c in self.all_clusters])
		self.update_clusters(labels, num_labels)
		print([c.type for c in self.all_clusters])
		self.reconsecutivize_clusters()

		if verbal:
			self.show_clusters()


	def update_clusters(self, labels, num_labels):
		new_doc_lists = self.get_new_document_lists(labels, num_labels)
		seeded_clusters_seen, to_delete = 0, []
		for cluster in self.all_clusters:
			if cluster.type == 'machine':
				to_delete.append(cluster) # These are getting wiped
			if cluster.type == 'seeded':
				cluster.wipe_non_seeds() # Remove non-seeded documents
				cluster.add_documents(new_doc_lists[seeded_clusters_seen], False) # The Nth seeded cluster you see is at the Nth index of the document list
				seeded_clusters_seen += 1

		self.delete_clusters(to_delete)

		for doc_list in new_doc_lists[seeded_clusters_seen:]:
			self.create_machine_cluster(doc_list)


	def get_new_document_lists(self, labels, num_labels):
		new_doc_lists = []
		for i, label_set in enumerate(labels):
			document = self.docs[i]
			if type(label_set) == list:
				for label in label_set:
					# The labels can skip values so that appending just one new list doesn't work.
					# For [[0], [2]], the document needing to be at [2] requires that [1] be appended first.
					if label >= len(new_doc_lists): # If you haven't seen this label before
						while label > len(new_doc_lists):
							new_doc_lists.append([])
						new_doc_lists.append([document]) # Make a list for its documents
					else: # Otherwise add new document to the existing list
						new_doc_lists[label].append(document)
		# Since some empty lists may have been added and may still be empty, they are removed here.
		new_doc_lists = [doc_list for doc_list in new_doc_lists if doc_list]
		return new_doc_lists


	# This probably doesn't need to be done, except for the fact that the front-end code uses IDs instead of indices 
	#    and it's slightly safer to do this from a UI perspective (I think...)
	def reconsecutivize_clusters(self):
		i = 0
		for cluster in self.all_clusters:
			cluster.ID = i
			i += 1
		[c.name_yourself() for c in self.all_clusters if c.type == 'machine' or c.type == 'seeded']


	def create_machine_cluster(self, documents):
		new_cluster = Cluster('machine', documents, self)
		self.all_clusters.append(new_cluster)
		return new_cluster


	def create_frozen_cluster(self, concept):
		cluster_docs = find_relevant_docs(self.docs, concept)[0] # This should have automated synonym search at some point
		new_cluster = Cluster('frozen', cluster_docs, self) # Executive decision: All new clusters should be frozen. Otherwise it's too hard for the user to parse.
		new_cluster.user_added = copy.deepcopy(cluster_docs)
		new_cluster.name = concept
		self.all_clusters = [new_cluster] + self.all_clusters
		return new_cluster


	def freeze_cluster(self, cluster_index):
		cluster_index = int(cluster_index)
		cluster = self.all_clusters[cluster_index]
		cluster.type = 'frozen'


	def delete_clusters(self, clusters):
		for cluster in clusters:
			self.delete_cluster(cluster)
		del(clusters)

	def delete_cluster(self, cluster):
		self.all_clusters.remove(cluster) # If you've moved the last document out of a cluster, it doesn't exist anymore.


	def delete_cluster_if_empty(self, cluster):
		if len(cluster.doc_list) == 0:
			self.delete_cluster(cluster)


	# Docs stuff ================================================================================================================================================================

	def move_document(self, uinput):
		doc_num, ci, cj = uinput[4:].split(',')
		doc_num, ci, cj = int(doc_num), int(ci), int(cj)
		launch_cluster = self.all_clusters[ci]

		if cj != -1:
			target_cluster = self.all_clusters[cj]
			doc_to_move = launch_cluster.doc_list[doc_num]

			if not self.copy_on:
				launch_cluster.remove_document(doc_to_move)
			target_cluster.add_document(doc_to_move, True)
			
			if target_cluster.type != 'frozen':
				target_cluster.type = 'seeded' # Now that something's been moved to this cluster, its type is 'seeded' -- unless it was frozen, in case it's still frozen.

		self.delete_cluster_if_empty(launch_cluster)



	def reorder_indices(self): # Revisit this if docs changes
		di, iic = [], []
		for i, doc in enumerate(self.docs):
			self.doc_index_dict[doc] = i
			di.append(i)
			iic.append(self.stripped_corpus.index(doc))
		self.doc_indices = di
		self.indices_in_corpus = iic




	def delete_doc(self, readable_doc):
		idx = self.readable_docs.index(readable_doc)
		doc = self.docs[idx]
		self.docs.remove(doc)
		self.readable_docs.remove(readable_doc)
		self.reorder_indices()

		for c in self.all_clusters:
			c.remove_document(doc)
			self.delete_cluster_if_empty(c)

	# UI stuff ================================================================================================================================================================
	def update_clicked_sentences(self):
		clicked_column = [ c for c in self.all_clusters if c.ID == int(self.clicked_cluster)]
		if len(clicked_column) > 0:
		    column_docs = clicked_column[0].doc_list
		    readable_column = [self.readable_docs[self.doc_index_dict[d]] for i, d in enumerate(column_docs)]
		    self.clicked_sentences = [d for d in readable_column if d in self.row_to_docs[self.clicked_row]]
		else:
			self.clicked_sentences = []


	def show_clusters(self):
		for c in self.all_clusters:
			c.print_yourself(self.doc_index_dict, self.readable_docs)


	def export_for_evaluation(self, filename):

		cluster_list, doc_list = [], []

		for i, doc in enumerate(self.docs):
			readable = self.readable_docs[i]
			doc_list.append(readable)
			labs = []
			for j, cluster in enumerate(self.all_clusters):
				if doc in cluster.doc_list:
					labs.append(j)
			cluster_list.append(labs)

		pd.DataFrame({'docs': doc_list, 'cluster': cluster_list}).to_csv(filename)


	def modify_mode_instructions(self):
		print("   To quit the grid: q ")
		print("   To exit modify mode: e ")
		print("   To show grid: s ")
		print("   To move a sentence from Cluster i to Cluster j: move sentence_num_in_i, i, j")
		print("   To define a new FROZEN cluster around a concept: new f 'concept', e.g., new f labor")
		print("   To seed a cluster around a concept: new s 'concept', e.g., new s labor")
		print("   To freeze a sentence in Cluster i: move sentence_num_in_i, i, i")
		print("   To freeze Cluster i: freeze i")

	def modify_mode(self):

		print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		print("~~~~~~~~~~~~~~~~~~~~~~~~~~~")
		print("You are now in modify mode. Here are your options: ")
		self.modify_mode_instructions()
		print("\n")


		uinput = None
		while uinput != 'q':
			uinput = input("Input action: ")

			if uinput == 'q':
				print("\nThanks, goodbye.\n\n\n")

			elif uinput == 'e':
				print("Exiting modify mode ")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				return uinput

			elif uinput == 's':
				self.show_clusters()
				print("\n")
				self.modify_mode_instructions()
				print("\n")

			elif uinput[0:4] == 'move':
				self.move_document(uinput)
				self.reconsecutivize_clusters()

			elif uinput[0:3] == 'new':
				sui = uinput.split(' ')
				self.create_frozen_cluster(sui[2])
				self.reconsecutivize_clusters()

			elif uinput[0:6] == 'freeze':
				self.freeze_cluster(uinput.split(' ')[1])
				self.reconsecutivize_clusters()

			else:
				print("Command not recognized. ")


		return uinput



# These are the columns of the Grid. Sentences have membership in one or more clusters.
class Cluster():
	def __init__(self, cluster_type, documents, grid):
		self.ID = None
		self.type = cluster_type			  # Whether the cluster is machine-generated, contains human-modified document(s), or frozen
		self.doc_list = documents     		  # A list of documents
		self.user_added = []          		  # A list of documents put here by a human. This is only updated during the modification step.
		self.grid = grid
		self.name_yourself()


	def add_documents(self, documents, added_by_user):
		for doc in documents:
			self.add_document(doc, added_by_user)

	def add_document(self, document, added_by_user):
		if document not in self.doc_list:
			self.doc_list.append(document)
		if added_by_user and document not in self.user_added:
			self.user_added.append(document)

	def wipe_non_seeds(self):
		self.doc_list = copy.deepcopy(self.user_added) # Get rid of everything that the user didn't add

	def remove_document(self, document):
		if document in self.doc_list:
			self.doc_list.remove(document)
		if document in self.user_added:
			self.user_added.remove(document)

	def print_yourself(self, doc_index_dict, readable_docs):
		print(str(self.ID) + ". Cluster ", self.name, " (", self.type, "): -----------------")
		for i, d in enumerate(self.doc_list):
			di = doc_index_dict[d]
			readable = readable_docs[di]
			if d in self.user_added:
				print(str(i) + ". ( user - added )   ", readable)
			else:
				print(str(i) + ". ( machine - added )   ", readable)
		print(" ---------------------------------- ")

	def name_yourself(self):
		cluster_name = get_cluster_name(2, self.doc_list, self.grid.doc_index_dict, self.grid.tfidf_vectorizer, self.grid.tfidf, self.grid.pmi, self.grid.anchor, self.grid.anchor_index, tfidf_pmi_weight = 0.1)
		self.name = ' / '.join([c[1] for c in cluster_name])







# Control panel ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

synonym_book = [['harvester', 'thresher', 'machinery', 'equipment'],
				['planting', 'sowing', 'seeding'],
				['labor', 'migrant', 'manual'],
				['horticulture', 'onion', 'tomato', 'cold', 'garden', 'vegetable', 'potato'],
				['credit', 'repay', 'loan', 'reimburse', 'reimbursement', 'back'], # should have bigrams?
				['cooperative','coop', 'coops', 'cooperatives'],
				['extension', 'saed'],
				['bank', 'banque', 'agricole'],
				['research', 'isra'],
				['yield', 'production', 'ton', 'tons', 'kg', 'bags']
				]

too_common = [['farmer', 'farmers'], ['rice'], ['dr', 'fall']]
corpus =  pd.read_csv(path + 'corpus.csv', header = None)
corpus.columns = ['sentence']

# grid = Grid('horticulture', 6, corpus, False, False, synonym_book, too_common)
# grid.generate_grid(0.2, 6, verbal = True)

# uinput = None
# while uinput != 'q':
# 	print()
# 	uinput = input("Enter (g) to (re)generate grid, (m) for modification mode, (s) to show grid, (q) to quit: ")
# 	if uinput == 'g':
# 		grid.generate_grid(0.1, 6)
# 	elif uinput == 'm':
# 		if grid.all_clusters == []:
# 			print("Nothing to modify! Try generating the grid.")
# 		else:
# 			uinput = grid.modify_mode()
# 	elif uinput == 's':
# 		grid.show_clusters()
# 	elif uinput == 'q':
# 		print("Thanks, goodbye. \n\n\n")
# 	else:
# 		print("Command not recognized. ")





















