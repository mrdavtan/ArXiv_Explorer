#!/bin/env python3

import pandas as pd
import numpy as np
import os

import json
import re

import openai

openai.api_key = os.environ["OPENAI_API_KEY"]

#Load the Arxiv metadata


cols = ['id', 'title', 'abstract', 'categories']
data = []
file_name = '../../../arxiv_data/arxiv-metadata-oai-snapshot.json'


with open(file_name, encoding='utf-8') as f:
    for line in f:
        if line.strip():  # Check if the line is not empty or whitespace
            doc = json.loads(line)
            lst = [doc['id'], doc['title'], doc['abstract'], doc['categories']]
            data.append(lst)

df_data = pd.DataFrame(data=data, columns=cols)

print(df_data.shape)

df_data.head()





