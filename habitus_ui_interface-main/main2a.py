
print("This is main2a.py")

import sys
sys.path.append("./backend")

from QA import QA
from user import User
from document import Document
from fastapi import FastAPI, Depends
from frontend import Frontend
from pandas import DataFrame
from starlette.middleware.cors import CORSMiddleware
import time
import pandas as pd
import os
from datetime import date

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UvicornFrontend(Frontend):
    def __init__(self, user, path: str, tracking_prefix: str, clustering_algorithm: str):
        super().__init__(path)
        self.user = user
        self.question_sets = {'survey': QA('survey', path, 'survey_questions.txt'), 'test': QA('test', path, 'test_questions.txt'), 'feedback': QA('feedback', path, 'feedback_questions.txt')}
        self.training = True
        self.path = path
        self.clustering_algorithm = clustering_algorithm
        self.copy_on = False
        self.clicked_col = None
        self.clicked_row = None
        self.track_actions = {'user_id':[], 'training':[], 'condition':[], 'round': [], 'actor': [], 'action':[], 'time': [], 'object_type': [], 'object_value': [], 'other_details': []}
        self.tracking_prefix = tracking_prefix
        self.round = 0

    def find_document(self, text: str) -> Document:
        return next(document for document in self.grid.documents if document.readable == text)

    def get_clicked_documents(self) -> list[Document]:
        if self.clicked_col == None and self.clicked_row == None:
            documents = []
        else:
            documents = self.grid.get_clicked_documents(self.clicked_col, self.clicked_row)
        return documents

    def show_grid(self) -> dict:
        clusters = self.grid.clusters
        rows = self.grid.rows

        # This doesn't include the trashed sentences.
        sentences = [document.readable for document in self.grid.documents]
        clicked_sentences = [document.readable for document in self.get_clicked_documents()]
        col_num_to_name = {index: cluster.name for index, cluster in enumerate(clusters)}
        frozen_columns = [index for index, cluster in enumerate(clusters) if cluster.is_frozen()]

        # If documents are in multiple columns, they will show up multiple times here.
        # The order will not be the same as with main.py.
        delta = 1.0 / len(sentences)
        row_contents = {}
        # map of row name to map of col index to number of sentences in that row and col
        heat_map: dict[str, dict[int, float]] = {row.name: {} for row in rows}
        for row_index, row in enumerate(rows):
            row_contents[row.name] = []
            for col_index, cluster in enumerate(clusters):
                cell_documents = self.grid.get_clicked_documents(col_index, row_index)
                row_contents[row.name] += cell_documents
                count = len(cell_documents)
                heat_map[row.name][col_index] = delta * count

        return {
            "question_sets": self.question_sets,
            "flag": self.user.flag,
            "anchor": self.grid.anchor,
            "sentences": sentences,
            "clicked_sentences": clicked_sentences,
            "grid": heat_map,
            "col_num_to_name": col_num_to_name,
            "frozen_columns": frozen_columns,
            "row_contents": row_contents,
            "anchor_book": self.grid.corpus.anchor_book,
            "synonym_book": self.grid.synonym_book
        }

    def load_new_grid(self, newAnchor: str, k: int):
        self.grid = self.backend.get_grid(self.user.flag, k, newAnchor, newAnchor, self.clustering_algorithm)
        self.clicked_row, self.clicked_col = None, None
        t = time.time()
        self.update_track_actions([self.round, 'human', 'new_grid', t, 'grid', newAnchor, None])
        self.update_grid_record('load', 'load', time.time())
        return self.show_grid()

    def update_anchor_book(self, key: str, value: str, add_or_remove: str):
        self.grid.update_for_anchor(key, value, add_or_remove)
        self.clicked_col = None
        self.clicked_row = None
        self.clicked_documents = self.get_clicked_documents()
        return self.show_grid()


    def toggle_copy(self) -> bool:
        self.copy_on = not self.copy_on
        return self.copy_on

    def load_grid(self, training, edit, anchor):

        if training:
            filename = 'training'
        else:
            filename = anchor + '_' + str(self.user.user_id)

        t = time.time()
        self.round = 0
        grid = self.backend.load_grid(self.user.flag, edit, filename, self.clustering_algorithm)
        if grid != None: # If the grid exists, load it. If it doesn't, keep the current grid.
            self.grid = grid
        self.copy_on = False
        self.clicked_col = None
        self.clicked_row = None
        self.update_track_actions([self.round, 'human', 'load', t, 'grid', self.grid.anchor, None])
        self.update_grid_record('load', 'load', time.time())
        return self.show_grid()

    def save_grid(self, filename: str) -> bool:
        print("Saving grid at ", filename)
        t = time.time()
        self.grid.dump(filename + '_' + str(self.user.user_id))
        self.update_track_actions([self.round, 'human', 'save', t, 'grid', self.grid.anchor, None])
        return True

    def trash(self, text: str) -> dict:
        t = time.time()
        document = self.find_document(text)
        self.grid.delete_document(document)
        self.update_track_actions([self.round, 'human', 'trash', t, 'sentence', text, None])
        return self.show_grid()


    def record_machine_moves(self, t):
        for i, c in enumerate(self.grid.clusters):
            if not c.is_frozen():
                for d in c.documents:
                    if d not in c.human_documents: # Only look at docs the machine moves, which aren't seeded and aren't frozen
                        self.update_track_actions([self.round, 'machine', 'move', t, 'sentence', d.readable, 'to_' + str(i)]) # Can't say which column something has been moved from during reclustering


    def regenerate(self) -> dict:
        t = time.time()
        self.round += 1
        if self.user.flag == 'control':
            self.grid.control_update()
        else:
            self.grid.regenerate()
        self.clicked_col = None
        self.clicked_row = None
        self.clicked_documents = self.get_clicked_documents()
        self.update_track_actions([self.round, 'human', 'update', t, 'grid', self.grid.anchor, None])
        self.record_machine_moves(t)
        self.update_grid_record('update', 'human', t)
        return self.show_grid()

    def set_name(self, col_index: int, name: str) -> dict:
        t = time.time()
        cluster = self.grid.clusters[col_index]
        self.update_track_actions([self.round, 'human', 'rename_cluster', t, 'cluster', name, 'old_' + cluster.name])
        can_freeze = not (self.user.flag == 'control' and col_index == 0)
        cluster.set_name(name, can_freeze) # This is so nobody can accidentally freeze the initial control column. Should usually be: cluster.set_name(name, True)
        return self.show_grid()

    def set_k(self, k: int) -> dict:
        t = time.time()
        self.grid.set_k(k)
        self.update_track_actions([self.round, 'human', 'set_k', t, 'k', k, None])
        return self.show_grid()

    def create_cluster(self, text: str) -> dict:
        t = time.time()
        frozen_docs = self.grid.create_human_cluster(text)
        self.update_track_actions([self.round, 'human', 'create_cluster', t, 'cluster', text, None])
        [self.update_track_actions([self.round, 'human', 'freeze', t, 'sentence', doc.readable, 'cluster_' + text]) for doc in frozen_docs]
        self.update_grid_record('create_cluster', 'human', t)
        return self.show_grid()

    def delete_frozen(self, col_index: int) -> dict:
        cluster = self.grid.clusters[col_index]
        t = time.time()
        if self.user.flag == 'control':
            original_column = [c for c in self.grid.clusters if not c.is_frozen()][0] # There should only be one non-frozen cluster in the control condition
            og_docs = original_column.documents.copy()
            original_column.documents += [d for d in cluster.documents if d not in og_docs] # Put back the frozen cluster into the original cluster
            new_name = self.grid.name_cluster(original_column.documents)
            original_column.set_name(new_name, False)
        self.update_track_actions([self.round, 'human', 'delete_cluster', t, 'cluster', cluster.name, None])
        self.grid.delete_cluster(col_index)
        return self.show_grid()

    def click(self, row_name: str, col_index: int, edit: bool) -> list[str]:
        t = time.time()
        row_index = next(index for index, row in enumerate(self.grid.rows) if row.name == row_name)
        self.clicked_row = row_index
        self.clicked_col = col_index
        documents = self.get_clicked_documents()
        texts = [document.readable for document in documents]
        if edit:
            self.update_track_actions([self.round, 'human', 'click', t, 'cell', str(row_index) + '_' + str(col_index), None])
        else:
            self.update_track_actions(['retrieval', 'human', 'click', t, 'cell', str(row_index) + '_' + str(col_index), None])
        return texts

    def sentence_click(self, text: str):
        t = time.time()
        document = next(document for document in self.grid.clusters[self.clicked_col].documents if document.readable == text)
        self.update_track_actions([self.round, 'human', 'click', t, 'sentence', text, None])
        return [document.pre_context, text.split('.',1)[1], document.post_context]

    # This moves the sentence from the currently clicked_col and clicked_row to
    # the new row and column.
    def move(self, row_index: str, col_index: int, text: str) -> dict:
        t = time.time()
        assert col_index >= 0 # We're not deleting sentences in this way.
        document = next(document for document in self.grid.clusters[self.clicked_col].documents if document.readable == text)
        if self.copy_on:
            self.grid.copy_document(document, self.clicked_col, col_index)
            self.update_track_actions([self.round, 'human', 'copy', t, 'sentence', text, 'from_'+str(self.clicked_col)+'_to_'+str(col_index)])
            self.update_grid_record('copy', 'human', t)
        else:
            self.grid.move_document(document, self.clicked_col, col_index)
            self.update_track_actions([self.round, 'human', 'move', t, 'sentence', text, 'from_'+str(self.clicked_col)+'_to_'+str(col_index)])
            self.update_grid_record('move', 'human', t)
        return self.show_grid()

    def update_grid_record(self, action, actor, t):
        grid_path = self.path + self.tracking_prefix + '_grid_' + str(self.user.user_id) + '.csv'
        df = self.grid.dump(grid_path, write = False)
        df['user_id'] = self.user.user_id
        df['training'] = self.training
        df['condition'] = self.user.flag
        df['round'] = self.round
        df['action'] = action
        df['actor'] = actor
        df['time'] = t
        df.to_csv(grid_path, mode = 'a', header = not os.path.exists(grid_path))

    def toggle_training(self):
        self.training = not self.training

    def update_track_actions(self, info):
        self.track_actions['user_id'].append(self.user.user_id)
        self.track_actions['training'].append(self.training)
        self.track_actions['condition'].append(self.user.flag)
        self.track_actions['round'].append(info[0])
        self.track_actions['actor'].append(info[1])
        self.track_actions['action'].append(info[2])
        self.track_actions['time'].append(info[3])
        self.track_actions['object_type'].append(info[4])
        self.track_actions['object_value'].append(info[5])
        self.track_actions['other_details'].append(info[6])

        pd.DataFrame(self.track_actions).to_csv(self.path + self.tracking_prefix + '_actions_' + str(self.user.user_id) + '.csv') # Just rewrite every time. Slower than appending?

    # Final answers
    def write_out_answers(self, questionSet):
        qset = self.question_sets[questionSet]
        df = qset.return_dataframe()
        df['user_id'] = self.user.user_id
        df['condition'] = self.user.flag
        df.to_csv(self.path + self.tracking_prefix + '_' + questionSet + '_' + str(self.user.user_id) + '.csv')
        qset.clear_answers()

    # Tracking for question-answering
    def update_question_answers(self, questionSet, questionIndex, selectedAnswerText):
        t = time.time()
        question_set = self.question_sets[questionSet]
        question = question_set.questions[questionIndex]
        question.update_given_answers(selectedAnswerText)
        currently_active, all_answered = question_set.return_active_answers()
        self.update_track_actions([question_set.name, 'human', 'answer', t, question.question_text, question.given_answers, None])
        return [currently_active, all_answered]

    def write_consent(self):
        consent = "Participant " + str(self.user.user_id) + " consented to participate in this study on " + str(date.today()) # Put ID number in string
        filename = 'results/consent_' + str(self.user.user_id) + '.txt' # Put ID number in here
        with open(self.path + filename, 'a') as file:
            file.write(consent)

max_k = 5
frontends = {} # dict[int, UvicornFrontend]
condition_filename = '../process_files/user_to_condition.csv'
treatment_clustering = 'kmeans'

# The purpose of the functions below is to
# - provide the entrypoint with @app.get
# - log the event for debugging and bookkeeping purposes
# - perform any necessary conversion on the parameters
# - call into the frontend to perform the action
# - return the right kind of result, probably forwarded from the frontend

@app.get("/data/{userID}")
def root(userID: int): # Depends( my function that changes data for front end )
    data = frontends[userID].show_grid()
    print("Root called ", frontends[userID].grid.anchor, " ----------------------------------------------------------------------")
    return data # returns to front end

# The following are not useful outside the experiment ---------------------------------------------------------------------------
@app.get("/setUser/{userID}")
async def setUser(userID: int):
    print("setting user: ", userID)
    user = User(condition_filename, userID)
    user.assign_flag()
    print("corresponding condition: ", user.flag)
    if user.flag:
        frontends[userID] = UvicornFrontend(user, '../process_files/', 'results/tracking', treatment_clustering)
        return True
    else:
        return False

@app.get("/loadTrainingGrid/{userID}")
async def loadTrainingGrid(userID: int):
    print("loadTrainingGrid")
    print("loading for user ", frontends[userID].user.user_id)
    frontends[userID].load_grid(True, True, "training")
    print(frontends[userID].grid.anchor, " grid now loaded")
    return frontends[userID].show_grid()

@app.get("/loadCurationGrid/{userID}")
async def loadCurationGrid(userID: int):
    print("loadCurationGrid")
    frontends[userID].load_new_grid('harvest', max_k)
    print(frontends[userID].grid.anchor, " grid now loaded")

@app.get("/loadTestGrid/{userID}")
async def loadTestGrid(userID: int):
    print("loadTestGrid")
    frontends[userID].load_grid(False, False, 'harvest')

# --------------------------------------------------------------------------------------------------------------------------------

@app.get("/loadNewGrid/{newAnchor}/{userID}")
async def loadNewGrid(newAnchor: str, userID: int):
    print("loadNewGrid", newAnchor)
    return frontends[userID].load_new_grid(newAnchor, max_k)

@app.get("/updateAnchorBook/{key}/{value}/{add_or_remove}/{userID}")
async def updateAnchorBook(key: str, value: str, add_or_remove: str, userID: int):
    print("updateAnchorBook", key, value, add_or_remove)
    return frontends[userID].update_anchor_book(key, value, add_or_remove)

@app.get("/drag/{row}/{col}/{sent}/{userID}")
async def drag(row: str, col: str, sent: str, userID: int):
    print("drag", f"Row: {row}\tCol: {col}\tText: {sent}")
    row, col, sent = row, int(col), sent
    return frontends[userID].move(row, col, sent)

@app.get("/click/{row}/{col}/{edit}/{userID}")
async def click(row: str, col: str, edit: bool, userID: int):
    print("click", row, col)
    row, col = row, int(col)
    return frontends[userID].click(row, col, edit)

@app.get("/sentenceClick/{text}/{userID}")
async def sentenceClick(text: str, userID: int):
    print("sentenceClick", text)
    return frontends[userID].sentence_click(text)

@app.get("/editName/{ix}/{newName}/{userID}")
async def editName(ix: int, newName: str, userID: int):
    print("editName", ix, newName)
    return frontends[userID].set_name(int(ix), newName)

@app.get("/deleteFrozenColumn/{ix}/{userID}")
async def deleteFrozenColumn(ix: int, userID: int):
    print("deleteFrozen", ix)
    return frontends[userID].delete_frozen(int(ix))

@app.get("/textInput/{text}/{userID}")
async def textInput(text: str, userID: int):
    print("textInput", text)
    return frontends[userID].create_cluster(text)

@app.get("/setK/{k}/{userID}")
async def setK(k: int, userID: int):
    print("setK", k)
    return frontends[userID].set_k(k)

@app.get("/regenerate/{userID}")
async def regenerate(userID: int):
    print("regenerate")
    return frontends[userID].regenerate()

@app.get("/copyToggle/{userID}")
async def copyToggle(userID: int):
    print("copyToggle")
    return frontends[userID].toggle_copy()

@app.get("/saveGrid/{text}/{userID}")
async def saveGrid(text: str, userID: int):
    print("saving grid")
    return frontends[userID].save_grid(text)

@app.get("/loadGrid/{text}/{userID}")
async def loadGrid(text: str, userID: int):
    print("loading grid ", text)
    grid = frontends[userID].load_grid(text)
    return grid

@app.get("/trash/{text}/{userID}")
async def trash(text: str, userID: int):
    print("trash ", text)
    return frontends[userID].trash(text)

@app.get("/toggleTraining/{userID}")
async def toggleTraining(userID: int):
    print("training off")
    return frontends[userID].toggle_training()

def fromHex(hex: str) -> str:
    return "".join([chr(int(hex[i:i+4], 16)) for i in range(0, len(hex), 4)])

@app.get("/answerQuestion/{questionSet}/{questionIndex}/{hexSelectedAnswerText}/{userID}")
async def answerQuestion(questionSet: str, questionIndex: int, hexSelectedAnswerText: str, userID: int):
    selectedAnswerText = fromHex(hexSelectedAnswerText)
    return frontends[userID].update_question_answers(questionSet, questionIndex, selectedAnswerText)

@app.get("/recordAnswers/{questionSet}/{userID}")
async def recordAnswers(questionSet: str, userID: int):
    print("writing out for ", questionSet)
    frontends[userID].write_out_answers(questionSet)
    if questionSet == 'feedback':
        time.sleep(60) # Wait 1 minute before removing the front end
        print("logging out ", userID)
        frontends.pop(userID)

@app.get("/recordConsent/{userID}")
async def recordConsent(userID: int):
    print("consent for ", userID)
    return frontends[userID].write_consent()







