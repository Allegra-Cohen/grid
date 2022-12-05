import ast
import numpy as np
import pandas as pd

class QA():
	def __init__(self, name: str, path: str, filename: str):
		self.name = name
		self.path = path
		self.questions = []

		# Open up the questions filename
		with open(path + filename, 'r') as file:
			qset = file.read().replace('\n', '').replace('\t', '').strip()
		listDict = ast.literal_eval(qset)

		self.listDict = listDict

		for i, qdict in enumerate(self.listDict):
			answers = [option['answerText'] for option in qdict['answerOptions']]
			self.questions.append(Question(i, qdict['questionType'], qdict['questionText'], answers))

	def return_active_answers(self):
		active = []
		are_all_questions_answered = True
		for question in self.questions:
			if question.given_answer_IDs == []:
				are_all_questions_answered = False
			active += question.given_answer_IDs
		return [active, are_all_questions_answered]

	def return_dataframe(self):
		sets, questions, answers = [], [], []
		for question in self.questions:
			sets.append(self.name)
			questions.append(question.question_text)
			answers.append(question.given_answers)
		return pd.DataFrame({'set': sets, 'question': questions, 'answer': answers})

	def clear_answers(self):
		for q in self.questions:
			q.given_answers, q.given_answer_IDs = [], []



	
class Question():
	def __init__(self, question_index: int, question_type: str, question_text: str, possible_answers: list[str]):
		self.index = question_index
		self.question_type = question_type
		self.question_text = question_text
		self.possible_answers = possible_answers
		self.given_answers = []
		self.given_answer_IDs = [] # This is because of how the formatting gets done in the front end

	def update_given_answers(self, answer):
		if self.question_type == 'select_all' and "Don't know" not in answer and np.any(["Don't know" not in a for a in self.given_answers]):
			# Toggling an existing answer
			if answer in self.given_answers:
				self.given_answers.remove(answer)
				self.given_answer_IDs.remove(str(self.index) + answer)
			else:
				self.given_answers.append(answer)
				self.given_answer_IDs.append(str(self.index) + answer)
		else:
			if answer in self.given_answers:
				self.given_answers = []
				self.given_answer_IDs = []
			else:
				self.given_answers = [answer]
				self.given_answer_IDs = [str(self.index) + answer]

