# docker build . -t grid
# docker-compose up -d
# docker-compose down

FROM ubuntu:20.04

# Install base packages
RUN export TZ=Etc/UTC
RUN export TERM=xterm
RUN apt update
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN DEBIAN_FRONTEND="noninteractive" apt -y install tzdata
RUN apt -y install dialog
RUN apt -y install apt-utils
RUN apt -y install curl
RUN apt -y install nano

# Install Python
RUN apt -y install python3-pip
RUN apt -y install python3.9
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1
RUN apt -y install python3.9-dev

# Install Python packages
# RUN pip3 install wheel==0.38.4
RUN pip3 install uvicorn==0.18.2
RUN pip3 install fastapi==0.80.0
RUN pip3 install gensim==3.8.3
RUN pip3 install pandas==1.2.3
RUN pip3 install nltk==3.7
RUN pip3 install sklearn==0.0
RUN pip3 install spacy==3.4.1

# Install Python data
RUN python3 -m spacy download en_core_web_sm
RUN python3 -c "import nltk; nltk.download('punkt')"

# Install grid and dependencies
RUN mkdir grid
ADD . /grid/

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt -y install nodejs
WORKDIR /grid/habitus_ui_interface-main/frontend
# WORKDIR must be defined before this command.
RUN npm install

# Run the experiment
WORKDIR /grid
EXPOSE 3000
ENTRYPOINT ["/bin/bash"]
CMD ["./experiment.sh"]
