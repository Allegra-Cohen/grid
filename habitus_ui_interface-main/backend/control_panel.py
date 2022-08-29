import pandas as pd

from frontend import Frontend

class ControlPanel(Frontend):
	def __init__(self, path: str, k: int):
		super().__init__(path)
		self.grid = self.backend.get_grid(k)
		self.copy_on = False
		self.show_clusters()

	def show_clusters(self):
		clusters = self.grid.clusters
		print("\n\n                F r o z e n    c l u s t e r s             *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* \n")
		for index, cluster in enumerate(clusters):
			if cluster.is_frozen():
				cluster.print_yourself(index)
		print("\n\n                S e e d e d    c l u s t e r s             *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* \n")
		for index, cluster in enumerate(clusters):
			if cluster.is_seeded():
				cluster.print_yourself(index)
		print("\n\n                M a c h i n e   c l u s t e r s            *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* \n")
		for index, cluster in enumerate(clusters):
			if not cluster.is_frozen() and not cluster.is_seeded():
				cluster.print_yourself(index)
		print("\n\n                T r a s h                                  *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* \n")
		for document in self.grid.trash:
			print(document.readable)

	def dump(self):

		def dump_documents():
			records = []
			for document in self.grid.documents:
				map = {row.name: document.is_member(row_index) for row_index, row in enumerate(self.grid.rows)}
				record = {
					'readable': document.readable,
					'stripped': document.stripped,
					'map': map
				}
				records.append(record)
			data = {
				'readable': [record['readable'] for record in records],
				'stripped': [record['stripped'] for record in records]
			}
			for row in self.grid.rows:
				data[row.name] = [record['map'][row.name] for record in records]
			pd.DataFrame(data).to_csv('documents2.csv')

		def dump_tokens():
			tokens = []
			for document_index, document in enumerate(self.grid.documents):
				tokens.append(document.tokens)
			pd.DataFrame({'tokens': tokens}).to_csv('tokens2.csv')

		def dump_vectors():
			vectors = []
			for document_index, document in enumerate(self.grid.documents):
				vectors.append(document.vector)
			pd.DataFrame({'vectors': vectors}).to_csv('vectors2.csv')

		def dump_cells():
			records = []
			for row_index, row in enumerate(self.grid.rows):
				for col_index, cluster in enumerate(self.grid.clusters):
					for document in self.grid.get_clicked_documents(col_index, row_index):
						record = {
							'row': row.name,
							'col': cluster.name,
							'readable': document.readable
						}
						records.append(record)
			data = {
				'row': [record['row'] for record in records],
				'col': [record['col'] for record in records],
				'readable': [record['readable'] for record in records]
			}
			pd.DataFrame(data).to_csv('cells2.csv')

		dump_documents()
		dump_tokens()
		dump_vectors()
		dump_cells()

	def run(self):
		user_input = None
		while user_input != 'q':
			print()
			user_input = input("Enter (g) to generate grid, (m) for modification mode, (s) to show grid, (d) to dump grid, (q) to quit: ")
			if user_input == 'g':
				self.grid.regenerate()
			elif user_input == 'm':
				if not self.grid:
					print("Nothing to modify! Try generating the grid.")
				else:
					user_input = self.modify_mode()
			elif user_input == 's':
				self.show_clusters()
			elif user_input == 'd':
				self.dump()
			elif user_input == 'q':
				print("Thanks, goodbye. \n\n\n")
			else:
				print("Command not recognized. ")

	def modify_mode_instructions(self):
		print("   To quit the grid: q ")
		print("   To exit modify mode: e ")
		print("   To show grid: s ")
		print("   To move a sentence from Cluster i to Cluster j: move sentence_num_in_i i j")
		print("   To move a sentence from Cluster i to the trash: move sentence_num_in_i i -1")
		print("   To define a new FROZEN cluster around a concept: new f 'concept', e.g., new f labor")
		print("   To seed a cluster around a concept: new s 'concept', e.g., new s labor")
		print("   To freeze a sentence in Cluster i: move sentence_num_in_i i i")
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

		user_input = None
		move_command = "move "
		new_command = "new "
		freeze_command = "freeze "
		while user_input != 'q':
			user_input = input("Input action: ")

			if user_input == 'q':
				print("\nThanks, goodbye.\n\n\n")

			elif user_input == 'e':
				print("Exiting modify mode ")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
				return user_input

			elif user_input == 's':
				self.show_clusters()
				print("\n")
				self.modify_mode_instructions()
				print("\n")

			elif user_input.startswith(move_command):
				_, sentence_num, from_cluster, to_cluster = user_input.split(' ')
				sentence_num, from_cluster, to_cluster = int(sentence_num), int(from_cluster), int(to_cluster)
				if to_cluster < 0:
					self.grid.delete_document_by_index(sentence_num, from_cluster)
				elif from_cluster == to_cluster:
					# What does freezing an individual document mean?
					self.grid.freeze_document(sentence_num, from_cluster)
				elif self.copy_on:
					self.grid.copy_document_by_index(sentence_num, from_cluster, to_cluster)
				else:
					self.grid.move_document_by_index(sentence_num, from_cluster, to_cluster)

			elif user_input.startswith(new_command):
				_, frozen_or_seeded, concept = user_input.split(' ')
				frozen, seeded, concept = frozen_or_seeded == 'f', frozen_or_seeded == 's', concept
				if frozen or seeded:
					self.grid.create_human_cluster(frozen, concept)

			elif user_input.startswith(freeze_command):
				_, cluster_index = user_input.split(' ')
				cluster_index = int(cluster_index)
				self.grid.freeze_cluster(cluster_index)

			else:
				print("Command not recognized. ")

		return user_input

if __name__ == '__main__':
	ControlPanel('../../process_files/', 6).run()
