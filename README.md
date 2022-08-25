# grid

This repository houses a prototype of the Habitus user interface.

## Installation

Implementation consists of two major components.  Interaction with the web browser is programmed in JavaScript using [React](https://reactjs.org/) and everything that entails.  This code lives in [habitus_ui_interface-main/frontend/src](./tree/main/habitus_ui_interface-main/frontend/src).  The natural language processing and clustering algorithms are implemented in Python and made accessible with [uvicorn](https://www.uvicorn.org/).  Entrypoints for that code are contained in [main2.py](./habitus_ui_interface-main/main2.py) which quickly calls out to the [backend](./habitus_ui_interface-main/backend).  Here are some tips on getting all of this installed from a Linux perspective.

1. `git clone https://github.com/Allegra-Cohen/grid`
1. `cd grid`
1. `sudo apt update`
1. `node -v` - Check to see that it is installed and version 14+.  If so, the next step is not necessary.
1. `sudo apt install nodejs` - If the default version  for your operating system is not new enough, additional [preparations](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04) may be needed.
1. `sudo apt install npm`
1. `cd habitus_ui_interface-main/frontend`
1. `npm install` - This will create the `node_modules` directory.
1. `cd ..`
1. `python3 --version` - You'll need version 3.9+.  If that's already the case, skip the next step.
1. `sudo apt install python3.9` - If this is not available, additional [preparations](https://cloudbytes.dev/snippets/upgrade-python-to-latest-version-on-ubuntu-linux) will again be necessary.
1. `pip3 install uvicorn`
1. `pip3 install fastapi`
1. `pip3 install gensim`
1. `pip3 install pandas`
1. `pip3 install nltk`
1. `pip3 install sklearn`
1. `pip3 install spacy`
1. `python3 -m spacy download en_core_web_sm`
1. `cd backend`
1. `python3 control_panel.py` - Make sure the console version works before continuing with execution of the networked version.
1. `cd ..`

## Execution

Error messages resulting from the commands below probably indicate that prerequisites similar to the ones just described are not pre-installed on your computer.  Some variation of the commands above will hopefully clear the errors. 

* In the directory `habitus_ui_interface-main` run `python3 -m uvicorn --reload main2:app`.  This will use port 8000 by default, so to avoid complaints, free up the port before executing the command. 
* In the directory `habitus_ui_interface-main/frontend` run `npm start`.  This will start a web server on port 3000 and open a browser on `http://localhost:3000` where you can observe the user interface.
