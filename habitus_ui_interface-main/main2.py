
print("This is main2.py")

import sys
sys.path.append("./backend")

from QA import QA
from document import Document
from fastapi import FastAPI, Depends
from frontend import Frontend
from pandas import DataFrame
from starlette.middleware.cors import CORSMiddleware
import time
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UvicornFrontend(Frontend):
    def __init__(self, flag: str, path: str, k: int, anchor: str, tracking_filename: str):
        super().__init__(path)
        self.question_sets = {'survey': QA('survey', path, 'survey_questions.txt')}
        self.flag = flag
        self.path = path
        self.grid = self.backend.get_grid(self.flag, k, anchor, anchor)
        self.copy_on = False
        self.clicked_col = None
        self.clicked_row = None
        self.show_grid()
        self.track_actions = {'round': [], 'actor': [], 'action':[], 'time': [], 'object_type': [], 'object_value': [], 'other_details': []}
        self.tracking_filename = tracking_filename
        self.round = 0
        self.update_grid_record()

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
            "flag": self.flag,
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

    def load_new_grid(self, newAnchor: str):
        k = self.grid.k
        self.grid = self.backend.get_grid(self.flag, k, newAnchor, newAnchor)
        self.clicked_row, self.clicked_col = None, None
        t = time.time()
        self.update_track_actions([self.round, 'human', 'new_grid', t, 'grid', newAnchor, None])
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

    def load_grid(self, anchor):
        t = time.time()
        self.round = 0
        grid = self.backend.load_grid(self.flag, anchor)
        if grid != None: # If the grid exists, load it. If it doesn't, keep the current grid.
            self.grid = grid
        self.copy_on = False
        self.clicked_col = None
        self.clicked_row = None
        self.update_track_actions([self.round, 'human', 'load', t, 'grid', self.grid.anchor, None])
        self.update_grid_record()
        return self.show_grid()

    def save_grid(self, filename: str) -> bool:
        print("Saving grid at ", filename)
        t = time.time()
        self.grid.dump(filename)
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
        self.grid.regenerate()
        self.clicked_col = None
        self.clicked_row = None
        self.clicked_documents = self.get_clicked_documents()
        self.update_track_actions([self.round, 'human', 'update', t, 'grid', self.grid.anchor, None])
        self.record_machine_moves(t)
        self.update_grid_record()
        return self.show_grid()

    def set_name(self, col_index: int, name: str) -> dict:
        t = time.time()
        cluster = self.grid.clusters[col_index]
        self.update_track_actions([self.round, 'human', 'rename_cluster', t, 'cluster', name, 'old_' + cluster.name])
        cluster.set_name(name, True)
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
        return self.show_grid()

    def click(self, row_name: str, col_index: int) -> list[str]:
        t = time.time()
        row_index = next(index for index, row in enumerate(self.grid.rows) if row.name == row_name)
        self.clicked_row = row_index
        self.clicked_col = col_index
        documents = self.get_clicked_documents()
        texts = [document.readable for document in documents]
        self.update_track_actions([self.round, 'human', 'click', t, 'cell', str(row_index) + '_' + str(col_index), None])
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
        else:
            self.grid.move_document(document, self.clicked_col, col_index)
            self.update_track_actions([self.round, 'human', 'move', t, 'sentence', text, 'from_'+str(self.clicked_col)+'_to_'+str(col_index)])
        return self.show_grid()

    def update_grid_record(self):
        grid_path = self.path + 'grid_' + self.tracking_filename
        df = self.grid.dump(grid_path, write = False)
        df['round'] = self.round
        df.to_csv(grid_path, mode = 'a', header = not os.path.exists(grid_path))

    def update_track_actions(self, info):
        self.track_actions['round'].append(info[0])
        self.track_actions['actor'].append(info[1])
        self.track_actions['action'].append(info[2])
        self.track_actions['time'].append(info[3])
        self.track_actions['object_type'].append(info[4])
        self.track_actions['object_value'].append(info[5])
        self.track_actions['other_details'].append(info[6])

        pd.DataFrame(self.track_actions).to_csv(self.path + self.tracking_filename) # Just rewrite every time. Slower than appending?

    # Final answers
    def write_out_answers(self, questionSet):
        df = self.question_sets[questionSet].return_dataframe()
        df.to_csv(self.path + questionSet + '_' + self.tracking_filename)

    # Tracking for question-answering
    def update_question_answers(self, questionSet, questionIndex, selectedAnswerText):
        t = time.time()
        question_set = self.question_sets[questionSet]
        question = question_set.questions[questionIndex]
        question.update_given_answers(selectedAnswerText)
        currently_active = question_set.return_active_answers()
        self.update_track_actions(['survey', 'human', 'answer', t, question.question_text, question.given_answers, None])
        return currently_active


frontend = UvicornFrontend('treatment', '../process_files/', 3, 'harvest', 'allegra_tracking_harvest.csv')

# The purpose of the functions below is to
# - provide the entrypoint with @app.get
# - log the event for debugging and bookkeeping purposes
# - perform any necessary conversion on the parameters
# - call into the frontend to perform the action
# - return the right kind of result, probably forwarded from the frontend

@app.get("/data")
def root(data: DataFrame = Depends(frontend.show_grid)): # Depends( my function that changes data for front end )
    return data # returns to front end


@app.get("/loadNewGrid/{newAnchor}")
async def loadNewGrid(newAnchor: str):
    print("loadNewGrid", newAnchor)
    return frontend.load_new_grid(newAnchor)

@app.get("/updateAnchorBook/{key}/{value}/{add_or_remove}")
async def updateAnchorBook(key: str, value: str, add_or_remove: str):
    print("updateAnchorBook", key, value, add_or_remove)
    return frontend.update_anchor_book(key, value, add_or_remove)

@app.get("/drag/{row}/{col}/{sent}")
async def drag(row: str, col: str, sent: str):
    print("drag", f"Row: {row}\tCol: {col}\tText: {sent}")
    row, col, sent = row, int(col), sent
    return frontend.move(row, col, sent)

@app.get("/click/{row}/{col}")
async def click(row: str, col: str):
    print("click", row, col)
    row, col = row, int(col)
    return frontend.click(row, col)

@app.get("/sentenceClick/{text}")
async def sentenceClick(text: str):
    print("sentenceClick", text)
    return frontend.sentence_click(text)

@app.get("/editName/{ix}/{newName}")
async def editName(ix: int, newName: str):
    print("editName", ix, newName)
    return frontend.set_name(int(ix), newName)

@app.get("/textInput/{text}")
async def textInput(text: str):
    print("textInput", text)
    return frontend.create_cluster(text)

@app.get("/setK/{k}")
async def setK(k: int):
    print("setK", k)
    return frontend.set_k(k)

@app.get("/regenerate/")
async def regenerate():
    print("regenerate")
    return frontend.regenerate()

@app.get("/copyToggle/")
async def copyToggle():
    print("copyToggle")
    return frontend.toggle_copy()

@app.get("/saveGrid/{text}")
async def saveGrid(text: str):
    print("saving grid")
    return frontend.save_grid(text)

@app.get("/loadGrid/{text}")
async def loadGrid(text: str):
    print("loading grid ", text)
    grid = frontend.load_grid(text)
    return grid

@app.get("/trash/{text}")
async def trash(text: str):
    print("trash ", text)
    return frontend.trash(text)


@app.get("/answerQuestion/{questionSet}/{questionIndex}/{selectedAnswerText}")
async def answerQuestion(questionSet: str, questionIndex: int, selectedAnswerText: str):
    return frontend.update_question_answers(questionSet, questionIndex, selectedAnswerText)

@app.get("/recordAnswers/{questionSet}")
async def recordAnswers(questionSet: str):
    return frontend.write_out_answers(questionSet)






