
print("This is main2.py")

import pandas as pd
import os
import time

from backend.document import Document
from backend.frontend import Frontend
from fastapi import FastAPI, Depends
from pandas import DataFrame
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UvicornFrontend(Frontend):
    def __init__(self, path: str, k: int, clustering_algorithm: str):
        super().__init__(path)
        self.path = path
        self.clustering_algorithm = clustering_algorithm
        self.grid = None
        self.copy_on = False
        self.clicked_col = None
        self.clicked_row = None
        self.track_actions = {'actor': [], 'action':[], 'time': [], 'object_type': [], 'object_value': [], 'other_details': []}

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
            "filename": self.grid.unique_filename,
            "anchor": self.grid.anchor,
            "sentences": sentences,
            "clicked_sentences": clicked_sentences,
            "grid": heat_map,
            "col_num_to_name": col_num_to_name,
            "frozen_columns": frozen_columns,
            "row_contents": row_contents,
            "error": False
        }

    def load_new_grid(self, newFilename: str, newAnchor: str):
        k = 5
        grid = self.backend.get_grid(k, newAnchor, newFilename, self.clustering_algorithm)
        if grid != None:
            self.grid = grid
            self.clicked_row, self.clicked_col = None, None
            self.update_track_actions(['human', 'new_grid', time.time(), 'grid', newAnchor, None])
            return self.show_grid()
        else:
            if len(self.backend.corpus.documents) == 0:
                return {"error": "Your anchor was not found in the corpus. Please keep in mind that the Grid cannot handle very new words like 'COVID' and proper names."}
            else:
                return {"error": "Your anchor was not common enough in the corpus to generate columns for a Grid."}


    def toggle_copy(self) -> bool:
        self.copy_on = not self.copy_on
        return self.copy_on

    def load_grid(self, unique_filename):
        self.round = 0
        grid = self.backend.load_grid(unique_filename, self.clustering_algorithm)
        if grid != None: # If the grid exists, load it. If it doesn't, keep the current grid.
            self.grid = grid
        self.copy_on = False
        self.clicked_col = None
        self.clicked_row = None
        self.update_track_actions(['human', 'load', time.time(), 'grid', unique_filename, None])
        return self.show_grid()

    def save_grid(self) -> bool:
        print("Saving grid at ", self.grid.unique_filename)
        self.grid.dump()
        self.update_track_actions(['human', 'save', time.time(), 'grid', self.grid.unique_filename, None])
        return True

    def save_as_grid(self, filename) -> dict:
        print("Saving grid at ", self.grid.unique_filename)
        self.update_track_actions(['human', 'save_as', time.time(), 'grid', filename, "old_" + self.grid.unique_filename])
        self.grid.dump() # Make sure the old one is saved
        self.grid.unique_filename = filename
        self.grid.dump() # Save grid at the new filename
        return self.show_grid()

    def delete_grid(self, filename) -> bool:
        self.grid = None
        files = [filename + '_' + file for file in ['cells.csv', 'vectors.csv', 'tokens.csv', 'specs.csv', 'documents.csv']]
        for file in files:
            os.remove(self.path + file)
        self.update_track_actions(['human', 'delete', time.time(), 'grid', filename, None])

    def trash(self, text: str) -> dict:
        document = self.find_document(text)
        self.grid.delete_document(document)
        self.save_grid()
        self.update_track_actions(['human', 'trash', time.time(), 'sentence', text, None])
        return self.show_grid()

    def regenerate(self) -> dict:
        self.grid.regenerate()
        self.clicked_col = None
        self.clicked_row = None
        self.clicked_documents = self.get_clicked_documents()
        self.save_grid()
        self.update_track_actions(['human', 'update', time.time(), 'grid', self.grid.unique_filename, None])
        return self.show_grid()

    def set_name(self, col_index: int, name: str) -> dict:
        cluster = self.grid.clusters[col_index]
        cluster.set_name(name, True)
        self.save_grid()
        self.update_track_actions(['human', 'rename_cluster', time.time(), 'cluster', name, 'old_' + cluster.name])
        return self.show_grid()

    def set_k(self, k: int) -> dict:
        self.grid.set_k(k)
        self.update_track_actions(['human', 'set_k', time.time(), 'k', k, None])
        return self.show_grid()

    def create_cluster(self, text: str) -> dict:
        frozen_docs = self.grid.create_human_cluster(text)
        self.save_grid()
        self.update_track_actions(['human', 'create_cluster', time.time(), 'cluster', text, None])
        [self.update_track_actions(['human', 'freeze', time.time(), 'sentence', doc.readable, 'cluster_' + text]) for doc in frozen_docs]
        return self.show_grid()

    def delete_frozen(self, col_index: int) -> dict:
        name = self.grid.clusters[col_index].name
        self.grid.delete_cluster(col_index)
        self.save_grid()
        self.update_track_actions(['human', 'delete_cluster', time.time(), 'cluster', name, None])
        return self.show_grid()

    def click(self, row_name: str, col_index: int) -> list[str]:
        row_index = next(index for index, row in enumerate(self.grid.rows) if row.name == row_name)
        self.clicked_row = row_index
        self.clicked_col = col_index
        documents = self.get_clicked_documents()
        texts = [document.readable for document in documents]
        self.update_track_actions(['human', 'click', time.time(), 'cell', str(row_index) + '_' + str(col_index), None])
        return texts

    def sentence_click(self, text: str):
        document = next(document for document in self.grid.clusters[self.clicked_col].documents if document.readable == text)
        self.update_track_actions(['human', 'click', time.time(), 'sentence', text, None])
        return [document.pre_context, text.split('.',1)[1], document.post_context]

    # This moves the sentence from the currently clicked_col and clicked_row to
    # the new row and column.
    def move(self, row_index: str, col_index: int, text: str) -> dict:
        assert col_index >= 0 # We're not deleting sentences in this way.
        document = next(document for document in self.grid.clusters[self.clicked_col].documents if document.readable == text)
        if self.copy_on:
            self.grid.copy_document(document, self.clicked_col, col_index)
            self.update_track_actions(['human', 'copy', time.time(), 'sentence', text, 'from_'+str(self.clicked_col)+'_to_'+str(col_index)])
        else:
            self.grid.move_document(document, self.clicked_col, col_index)
            self.update_track_actions(['human', 'move', time.time(), 'sentence', text, 'from_'+str(self.clicked_col)+'_to_'+str(col_index)])
        self.save_grid()
        return self.show_grid()


    # If you want to turn tracking off, here's where to look  ================================================================================================================================================================
    # def record_machine_moves(self, t):
    #     for i, c in enumerate(self.grid.clusters):
    #         if not c.is_frozen():
    #             for d in c.documents:
    #                 if d not in c.human_documents: # Only look at docs the machine moves, which aren't seeded and aren't frozen
    #                     self.update_track_actions([self.round, 'machine', 'move', t, 'sentence', d.readable, 'to_' + str(i)]) # Can't say which column something has been moved from during reclustering

    # def update_grid_record(self):
    #     grid_path = self.path + 'grid_' + self.tracking_filename
    #     df = self.grid.dump(grid_path, write = False)
    #     df['round'] = self.round
    #     df.to_csv(grid_path, mode = 'a', header = not os.path.exists(grid_path))

    def update_track_actions(self, info, on = True): # Just set this to on = False if you don't want to be tracked
        self.track_actions['actor'].append(info[0])
        self.track_actions['action'].append(info[1])
        self.track_actions['time'].append(info[2])
        self.track_actions['object_type'].append(info[3])
        self.track_actions['object_value'].append(info[4])
        self.track_actions['other_details'].append(info[5])

        if on:
            pd.DataFrame(self.track_actions).to_csv(self.path + 'action_report.csv') # Just rewrite every time. Slower than appending?

    # ==================================================================================================================================================================================================================================


frontend = UvicornFrontend('../process_files/', 6,'kmeans')

# The purpose of the functions below is to
# - provide the entrypoint with @app.get
# - log the event for debugging and bookkeeping purposes
# - perform any necessary conversion on the parameters
# - call into the frontend to perform the action
# - return the right kind of result, probably forwarded from the frontend

@app.get("/data/")
def root(data: DataFrame = Depends(frontend.show_grid)): # Depends( my function that changes data for front end )
    return data # returns to front end

@app.get("/showGrids/")
async def showGrids():
    grids = []
    for file in os.listdir(frontend.path):
        if file.endswith("specs.csv"): # All Grids write out an anchor file
            gridName = file.rsplit('_', 1) # But not all Grids are named by the anchor, they have their own filenames
            grids.append(gridName[0])
    grids.sort()
    return {'grids': grids, 'filepath': frontend.path}

@app.get("/processSupercorpus/")
async def processSupercorpus(supercorpusFilepath: str):
    print(supercorpusFilepath)
    return frontend.backend.process_supercorpus(supercorpusFilepath)

@app.get("/setSuperfiles/")
async def setSuperfiles(corpusFilename: str, rowFilename: str):
    return frontend.backend.set_superfiles(corpusFilename, rowFilename)

@app.get("/loadNewGrid/")
async def loadNewGrid(corpusFilename: str, rowFilename: str, newFilename: str, newAnchor: str):
    print("loadNewGrid", newFilename, newAnchor)
    # print("!!!!!", frontend.backend.set_superfiles(corpusFilename, rowFilename))
    if frontend.backend.set_superfiles(corpusFilename, rowFilename):
        return frontend.load_new_grid(newFilename, newAnchor) # If this is false, it means the anchor didn't work
    else:
        print("gotcha")
        return {"error": "Please double check your corpus and row label files. One or more of them does not exist in the filepath you provided."} # Files don't exist

@app.get("/loadGrid/")
async def loadGrid(text: str):
    print("loading grid ", text)
    grid = frontend.load_grid(text)
    return grid

@app.get("/saveGrid/")
async def saveGrid():
    print("saving grid")
    return frontend.save_grid()

@app.get("/saveAsGrid/")
async def saveAsGrid(text: str):
    print("saving grid as ", text)
    return frontend.save_as_grid(text)

@app.get("/deleteGrid/")
async def deleteGrid(text: str):
    print("deleting ", text)
    return frontend.delete_grid(text)

@app.get("/drag/")
async def drag(row: str, col: int, sent: str):
    print("drag", f"Row: {row}\tCol: {col}\tText: {sent}")
    return frontend.move(row, col, sent)

@app.get("/click/")
async def click(row: str, col: int):
    print("click", row, col)
    return frontend.click(row, col)

@app.get("/sentenceClick/")
async def sentenceClick(text: str):
    print("sentenceClick", text)
    return frontend.sentence_click(text)

@app.get("/editName/")
async def editName(id: int, name: str):
    print("editName", id, name)
    return frontend.set_name(id, name)

@app.get("/deleteFrozenColumn/")
async def deleteFrozenColumn(id: int):
    print("deleteFrozen", id)
    return frontend.delete_frozen(id)

@app.get("/textInput/")
async def textInput(text: str):
    print("textInput", text)
    return frontend.create_cluster(text)

@app.get("/setK/")
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

@app.get("/trash/")
async def trash(text: str):
    print("trash ", text)
    return frontend.trash(text)
