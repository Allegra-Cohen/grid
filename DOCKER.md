1. docker run --name grid_container --volume grid_volume -it -p3000:3000 ubuntu:20.04 /bin/bash

1. docker run --name grid_container --volume grid_volume -it -p3000:3000 python:3.9 /bin/bash

1. export TZ=Etc/UTC
1. export DEBIAN_FRONTEND=noninteractive
1. apt update
1. apt -y install tzdata

#1. update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1
1. apt -y install python3-pip
1. apt -y install python3.9
1. update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 2
1. apt -y install python3.9-dev


1. pip3 install uvicorn==0.18.2
1. pip3 install fastapi==0.80.0
1. pip3 install gensim==3.8.3
1. pip3 install pandas==1.2.3
1. pip3 install nltk==3.7
1. pip3 install sklearn==0.0
1. pip3 install spacy==3.4.1

1. python3 -m spacy download en_core_web_sm
1. python3 -c "import nltk; nltk.download('punkt')"

1. docker cp . grid_container:/grid

1. cd grid
1. apt -y install nodejs
1. apt -y install npm
1. cd habitus_ui_interface-main/frontend
1. npm install
1. cd ..

# This is only a test
1. cd backend
1. python3 control_panel.py
1. cd ..

1. python3 -m uvicorn --reload main2:app &
1. cd frontend
1. npm start

