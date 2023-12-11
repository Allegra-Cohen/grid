# The Grid
 
Welcome to the Grid! This is a prototype tool for visualizing and curating qualitative information. The Grid is set up to handle text — we've used it to curate expert knowledge, interview transcripts, abstracts, and emails!
 
## Installation
1. `Python3 is required - You'll need version 3.9+. If that's already the case, skip the next
step. * To check your python version, you may open Command Prompt (Windows) or Terminal (MacOS) and type python3 --version`

1. `Install python3`
[Python](https://www.python.org/downloads/release/python-3106/)

1. `Install The Grid`
[Windows](https://github.com/Allegra-Cohen/grid/releases/tag/grid-windows-v0.1) or
[macOS](https://github.com/Allegra-Cohen/grid/releases/tag/grid-macOS-v0.1)

1. `Wait while the required python packages are being installed and the software start the local server`

## Using the Grid 
Grids are visualizations of corpora, i.e., collections of text. The Grid organizes text from a corpus into two dimensions: Rows, which represent static features of the corpus (like a list of interviewees or a timeline of dates mentioned), and columns, which represent important topics in the corpus. This is a Grid built using some excerpts from Wikipedia.
 
The color of the squares indicate how much text is in each. Click on a few squares and you’ll find that the right-hand panel shows the sentences inside. Click on the sentences and you can see the surrounding context.
 
### Column curation
Remember that we said that the columns should organize text into “important” topics? Well, the Grid is designed to help you iteratively discover which topics matter to you from your corpus.
 
This Grid has been initialized with five columns, created by clustering sentences from the corpus. There is also an “Unassigned” column that contains sentences that did not meet any clustering thresholds. You can tell that the columns are all machine-generated because the names are in blue. The names of the columns are the two top words as ranked by tf-idf. 
 
Some of these columns look pretty good; others, not so much. The Grid allows you to do several things to get better columns. The first thing you can do is drag sentences between columns. Try this out! Drag a few sentences between columns and note that the names of the columns change to reflect their new contents. 
 
Dragging sentences is great for small, precise changes, but it would take too long to organize a corpus just by dragging. To make bigger changes, you can create and rename columns. You can create a column using a keyword like “machine” or a Boolean query like “(machine OR computer) AND cognition”. Do this when you want a column that contains only certain documents. For example, suppose you want a column with only sentences about computers. Type “computer” into the box labeled “Create new column” and press the Enter key. A new column is created, with the name in black indicating that it is *frozen.* When you freeze a column, you tell the machine that it is not allowed to put documents into that column or take documents out.
 
You can also rename an existing column to freeze it. Type a new name into any of the “Rename” boxes below the columns and press the Enter key. Do this when you are happy with an existing column and do not want it to change. 
 
Why would we need to freeze columns? Well, notice that even though you now have a “computer” column, the sentences containing the keyword “computer” are still duplicated in other columns. This can be annoying if you want to keep columns as separate as possible. Moreover, you might want to know how the Grid would organize the remaining sentences now that you have made your column, because the point of the Grid is that it should be doing some of the organizational work for you. 
 
To let the Grid know about your changes, click the “Update Grid” button. This will rerun the Grid’s clustering algorithm and replace all blue-text columns with the new clustering solution. Frozen columns (with black text names) won’t be touched. Additionally, sentences that you have dragged will stay together during re-clustering. That is, you might know that you want a handful of sentences to go together but you’re not sure what else should go with them; if you drag those sentences into the same column, then the Grid will keep them together during re-clustering.
 
Play around with freezing, dragging sentences, and updating. You will probably find that sometimes the Grid pulls out interesting themes that you want to keep, and sometimes not. It’s a collaborative process!
 
The Grid lets you do some other things:
- Hitting the “copy” button lets you add a sentence to a column without removing it from its original column.
- Press the little trash can icon to delete a column. The sentences in the column will go into the Unassigned column; you need to press “Update” to get them back into the rest of the Grid, or drag them one by one.
- To set the maximum number of machine-generated columns, type a number into the "Max. columns" box and hit Enter. Nothing will happen in the GUI but *k* will have been set.
- The Grid saves every time you do something, but you can “save as” by typing a new title into the “Save as” box and hitting enter. This works the usual way. New Grids will appear in the Gallery.
 
A last couple rules of operation:
- You can drag sentences from frozen column to frozen column and from unfrozen column to frozen column, but you can’t drag sentences from frozen to unfrozen column and have them stay there during updating. 
- Sentences only drag between columns, not rows.
 
## Using your own corpus
 
### Preprocessing your corpus
The above tutorial uses a corpus that we created for you, but you presumably want to curate your own! Click on the “Upload or update corpus” button.
 
This page asks for a filepath to a folder with documents in it. (Important: End the filepath with a slash!) You can use .doc, .docx, .txt or .rtf documents. *The name of the corpus comes from the name of the folder, and the default row labels of a Grid comes from the names of the documents.* For example, if you have three text documents containing interviews with three different experts, you might want to name them “Expert A”, “Expert B”, and “Expert C”; if you do that, then text in your Grid will be organized by expert. (We go further into the rows issue in the FAQs section.)
 
Creating a corpus is simple, but it’s worth knowing what goes on behind the scenes. Clicking on “Ready!” will trigger a series of events. First, the text is split into sentences and cleaned (see FAQs for how to deal with document delimitation.) This will produce the files `process_files/[your_corpus_name].csv` and `process_files/cleaned_[your_corpus_name].csv`. Row labels are also assigned to sentences, which produces `process_files/[your_corpus_name]_row_labels.csv`. 
 
Then, internal to the program, a Corpus object is initialized with a list of Document objects containing information about the sentences. (If you’re anchoring your Grid, meaning restricting the corpus to a subcorpus of documents containing just a keyword or a Boolean query, this happens now.) 
 
Lastly, vector embeddings are calculated and stored for each Document. This is why you had to download the GloVe model. This step will also take *a very long time* if your corpus is large (>100 sentences; see “A word about runtime” below.) It will produce files called `[your_corpus_name]_doc_distances_lem.npy`, which contains a matrix of the distances between each document, and `[your_corpus_name]_doc_vecs_lem.json` which contains the vector embeddings of the documents. 
 
If you upload a new version of an existing corpus, these pre-processing steps will only be re-run on the new material. This is good because it will take less time; this is bad if you want to change some component, such as using a different vector embedding model. If the latter is true, just delete the `.npy` and `.json` files above. 
 
All of the files generated during this step will be stored in the `process_files` folder; do not move them or the Grid will not know where to look.
 
### Referring to your corpus
Once your corpus is processed, you’re ready to use it to create a Grid! Navigate back to the Gallery and click on “Create Grid.” This page asks you for a bunch of filenames, all of which use the `../process_files/` file path:
- * *Which corpus will you use?*  Just use the name of the corpus file, which should be `[your_corpus_name].csv`.
- * *Which row labels will you use?*  Here you can either put the default, which should be `[your_corpus_name]_row_labels.csv`, or your own labels file (see FAQs).
- * *Do you want to anchor your Grid?*  Here you can enter an anchor, either a keyword like “harvest” or a Boolean query like “planting OR harvest”. Or you can keep it blank to look at the whole corpus (see “A word about runtime” below.)
- * *What filename do you want to save your Grid with?*  Self-explanatory. The Grid will save in `process_files/`.
 
Clicking “Ready!” will generate a Grid using your corpus! This step should not take as long as the corpus preprocessing, but refer to “A word about runtime” below.
 
## Other files in process_files/
Grids are saved and loaded using five files:
* The `specs` file (`[your_grid_name]_specs.csv`) records Grid specifics like the anchor and relevant filenames.
* The `cells` file (`[your_grid_name]_cells.csv`) records which documents go in which columns and rows; this file is used to reconstruct saved Grids.
* `vectors` (`[your_grid_name]_vectors.csv`) and
* `tokens` (`[your_grid_name]_tokens.csv`) are not currently used by the rest of the Grid.
* There is also per grid a documents file (`[your_grid_name]_documents.csv`).
 
## FAQs
These are primarily pointers to where in the code an excited and industrious person might answer their own question.
 
- * *What if I want to cluster paragraphs or whole papers instead of sentences?*  Take that up with `habitus_ui_interface-main/backend/corpus_parser.py`. You may also want to change how the average vector embedding of a document is calculated.
- * *Do you remove stopwords and lemmatize?*  Yes. You can turn this off and on in `linguist.py`.
- * *I have an opinion about your choice of clustering algorithm.*  Neat! You can write your own class of clustering algorithm that inherits from ClusterGenerator (see ``habitus_ui_interface-main/backend/soft_kmeans.py`` as an example). In order to plug a new ClusterGenerator in, you currently need to change code in two places: 1) The frontend instantiation [here](https://github.com/Allegra-Cohen/grid/blob/3c05c59f734baaf3849b572ef992f097311879ee/habitus_ui_interface-main/main2.py#L226) and 2) Directly call the ClusterGenerator in the Grid instantiation [here](https://github.com/Allegra-Cohen/grid/blob/3c05c59f734baaf3849b572ef992f097311879ee/habitus_ui_interface-main/backend/grid.py#L28).
- * *What if I want to define my own rows?*  You have a few options! 1) Manually create a row labels file, put it in the `process_files/` folder, and use that filepath when creating your Grid. 2) Assign text to the right text files before creating your corpus. 3) Create a classifier for automatically labeling rows. If you want to do this, make sure you’re using the right input, i.e. the cleaned_[corpus] file generated during the corpus creation process, otherwise it won’t align with what the rest of the Grid is doing.
 
## A word about runtime
The Grid currently runs very slowly for corpora above ~100 documents. This is for two reasons: First, pre-processing the corpus using the vector embedding model costs a lot of time because that model is large. Fortunately you only have to do this once. Second, k-means clustering and many of its variations are actually pretty slow. We vectorize as much as we can but the runtime is not great. Our top priority is decreasing the time costs of a Grid update without making the clustering terrible. Some avenues being considered:
- Write better code or switch to a faster language
- Try a different algorithm (but this is constrained by the clustering algorithm needing to interface with the Grid and its rules about human decisions taking priority)
- Pre-process corpora such that only meaningful documents get clustered and documents without enough interesting information in them get dumped.

# How to run the application (For developers)

1. `git clone https://github.com/Allegra-Cohen/grid.git`
2. `git checkout grid-mac`
3. `cd .\habitus_ui_interface-main\frontend`
4. `yarn install`
5. `yarn electron:serve`

## Project Structure

This project leverages React with Electron, a framework that allows for building cross-platform desktop applications using web technologies.

The backend server is initiated through main.js, located in the public directory. This file serves as the main entry point for Electron, handling the creation of application windows and managing Electron-specific processes.

All Python packages used in the project are installed in a virtual environment during the initial project execution. This ensures a clean and isolated Python environment, preventing conflicts with system-wide Python installations.

To create a new version of the application, simply execute the command `yarn electron:build`. This command triggers the Electron Builder, and the resulting executable file will be located in the frontend/dist directory. This executable file is the standalone version of your Electron application.

```plaintext
.
├── backend                  # Back end source code written in Python
│   ├── _init_.py         
│   ├── ...
├── frontend                 # Front end source code written in React
│   ├── public               
│   │   ├── main.js          # It is responsible for creating an application window, managing operating system events and performing other tasks related to the Electron execution environment.
│   │   └── ...
│   ├── src
        └── ...              
├── process_files             # Files are saved here when a corpus is created and used for clustering
│   └── ...
├── main2.py                  # Connects the front end to the back end
└── ...

