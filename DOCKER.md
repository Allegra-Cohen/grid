# Docker use

Build the image from this directory using
```sh
docker build . -t grid
```

Start the container from this directory with
```sh
docker-compose up -d
```
and stop the container with
```sh
docker-compose down
```

<hr>

## Notes for preparing the image

### Get docker started
1. volume create grid_volume
1. docker run --name grid_container --volume grid_volume -it -p3000:3000 ubuntu:20.04 /bin/bash

### Install base packages
1. export TZ=Etc/UTC
1. export TERM=xterm
1. apt update
1. echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
1. export DEBIAN_FRONTEND=noninteractive apt -y install tzdata
1. apt -y install dialog
1. apt -y install apt-utils
1. apt -y install curl
1. apt -y install nano

### Install Python
1. apt -y install python3-pip # will install python 3.8
1. apt -y install python3.9
1. update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
1. apt -y install python3.9-dev

### Install Python packages
1. pip3 install uvicorn==0.18.2
1. pip3 install fastapi==0.80.0
1. pip3 install gensim==3.8.3
1. pip3 install pandas==1.2.3
1. pip3 install nltk==3.7
1. pip3 install sklearn==0.0
1. pip3 install spacy==3.4.1

### Install Python data
1. python3 -m spacy download en_core_web_sm
1. python3 -c "import nltk; nltk.download('punkt')"


### Install grid and dependencies
1. mkdir grid
1. docker cp . grid_container:/grid # from outside this shell

1. curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
1. apt -y install nodejs
1. cd /grid/habitus_ui_interface-main/frontend
1. npm install

### Run the experiment
1. cd /grid/habitus_ui_interface-main
1. python3 -m uvicorn --reload main2:app &
1. cd frontend
1. npm start

Now access the experiment via http://localhost:3000.
