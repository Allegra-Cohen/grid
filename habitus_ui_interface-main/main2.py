
print("This is main2.py")

import sys
sys.path.append("..")
sys.path.append("./backend")

import pandas as pd

from fastapi import FastAPI, Depends
from frontend import Frontend
from grid import *
from grid_functions import *
from pandas import DataFrame
from starlette.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UvicornFrontend(Frontend):
    def __init__(self, path: str, k: int):
        super().__init__(path)
        self.grid = self.backend.get_grid(k)
        self.grid.show_clusters()
        self.copy_on = False

frontend = UvicornFrontend('../process_files/', 6)

# nlp = en_core_web_sm.load()
nlp = spacy.load("en_core_web_sm")

# grid = Grid('harvest', 8, corpus, False, False, synonym_book, too_common)
grid = Grid('horticulture', 6, corpus, False, False, synonym_book, too_common)
grid.generate_grid(0.2, 6, verbal = True)

def show_grid():

    data: DataFrame = pd.read_csv(path + "row_labels_horticulture.csv") # Need this to get the row classifications for each sentence
    cleaned_labels = list(data['readable'])

    sentences = grid.readable_docs

    row_names = "other proportions processes decisions conditions causes".split()
    col_numbers = list(range(len([c for c in grid.all_clusters if c.doc_list != []])))

    # I will compute each cell's value as the ratio of row/col co-occurrence by the number of rows in the table
    heat_map = {r:{c:0. for c in col_numbers} for r in row_names}
    col_num_to_name = {}
    frozen_columns, row_contents = [], {}
    for i, readable_doc in enumerate(sentences):
        for ci, cluster in enumerate(grid.all_clusters):
            if cluster.type == 'frozen':
                frozen_columns.append(ci)
            if cluster.doc_list != []:
                for row_name in row_names:
                    stripped_doc = grid.docs[i]
                    if stripped_doc in cluster.doc_list and readable_doc in cleaned_labels:
                        doc_index = cleaned_labels.index(readable_doc)
                        labels = data.loc[doc_index, :]
                        if labels[row_name] == 1:
                            heat_map[row_name][ci] += 1
                            col_num_to_name[ci] = cluster.name
                            if row_name in row_contents.keys():
                                row_contents[row_name].append(readable_doc)
                            else:
                                row_contents[row_name] = [readable_doc]
                    # else:
                        # print(data_sentence, " not in csv")

    for row in heat_map.values():
        for c in row:
            row[c] /= len(sentences)
    print(heat_map)

    return {
        "sentences": sentences,
        "clicked_sentences": grid.clicked_sentences,
        "grid": heat_map,
        "col_num_to_name": col_num_to_name,
        "frozen_columns": frozen_columns,
        "row_contents": row_contents
    }



@app.get("/data")
def root(data: DataFrame = Depends(show_grid)): # Depends( my function that changes data for front end )
    return data # returns to front end


@app.get("/drag/{row}/{col}/{sent}")
async def drag(row: str, col: str, sent: str):
    message = f"Row: {row}\tCol: {col}\tText: {sent}"
    print(message)

    print("Clicked cluster ID pre-drag: ", grid.clicked_cluster)
    print("Clicked cluster doc_list pre-drag:", [ c for c in grid.all_clusters if c.ID == int(grid.clicked_cluster)][0].doc_list)

    cluster = [c for c in grid.all_clusters if c.ID == int(col)][0]
    print("Sentence: ",sent)
    # print("Readable: ",grid.readable_docs)
    stripped_sentence = grid.docs[grid.readable_docs.index(sent)]
    print(sent)
    print(stripped_sentence)
    print(grid.all_clusters[grid.clicked_cluster].doc_list)
    si = grid.all_clusters[grid.clicked_cluster].doc_list.index(stripped_sentence)
    grid.move_document('move ' + str(si) + ',' + str(grid.clicked_cluster) + ',' + str(col))
    grid.reconsecutivize_clusters()
    grid.update_clicked_sentences()

    print("Clicked cluster ID post-drag: ", grid.clicked_cluster)
    postdrags = [ c for c in grid.all_clusters if c.ID == int(grid.clicked_cluster)]
    if len(postdrags) > 0:
        print("Clicked cluster doc_list post-drag: ", [ c for c in grid.all_clusters if c.ID == int(grid.clicked_cluster)][0].doc_list)
    else:
        print("Clicked cluster doc_list post-drag: cluster doesn't exist")

    return show_grid()


@app.get("/click/{row}/{col}")
async def click(row: str, col: str):
    grid.reconsecutivize_clusters()
    column_docs = [ c for c in grid.all_clusters if c.ID == int(col)][0].doc_list
    readable_column = [grid.readable_docs[grid.doc_index_dict[d]] for i, d in enumerate(column_docs)]
    print(len(column_docs))
    print(len(readable_column))
    grid.clicked_sentences = [d for d in readable_column if d in grid.row_to_docs[row]] # intersection w/ row
    print(len(grid.clicked_sentences))
    grid.clicked_cluster = int(col)
    print("Clicked cluster ID: ", col)
    print("Clicked cluster doc_list: ", [ c for c in grid.all_clusters if c.ID == int(col)][0].doc_list)
    grid.clicked_row = row

    return grid.clicked_sentences

@app.get("/editName/{ix}/{newName}")
async def editName(ix: int, newName: str):
    cluster = [ c for c in grid.all_clusters if c.ID == int(ix)][0]
    cluster.name = newName
    grid.freeze_cluster(ix) # Naming a cluster should freeze it. This also freezes its name.
    return show_grid()


@app.get("/textInput/{text}")
async def textInput(text: str):
    message = f"Text input: {text}"
    grid.create_frozen_cluster(text) # Zero error handling here
    grid.reconsecutivize_clusters()
    grid.update_clicked_sentences()
    return show_grid()


@app.get("/setK/{k}")
async def setK(k: int):
    grid.k = k
    return show_grid()


@app.get("/regenerate/")
async def regenerate():
    grid.generate_grid(0.1, grid.k) # Past the first generation, should we ask for k or does that cause overlap?
    grid.reconsecutivize_clusters()
    grid.update_clicked_sentences()
    return show_grid()


@app.get("/copyToggle/")
async def copyToggle():
    grid.copy_on = not grid.copy_on
    return grid.copy_on


@app.get("/trash/{text}")
async def trash(text:str):
    print("trash ", text)
    grid.delete_doc(text)
    grid.reconsecutivize_clusters()
    grid.update_clicked_sentences()
    return show_grid()














