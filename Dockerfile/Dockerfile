FROM continuumio/anaconda3:2019.03

RUN apt-get update && \
    apt-get install -y build-essential && \
    pip install pip==19.0.3 setuptools==46.1.3

ADD . openslide-python

RUN cd openslide-python && \
    pip install .