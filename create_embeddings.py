#!/bin/env python3
import pandas as pd
import multiprocessing
import time
import zipfile
import numpy as np
import os
import json
import re
import openai
from sentence_transformers import SentenceTransformer

openai.api_key = os.environ["OPENAI_API_KEY"]

category_map = 'category_map.json'

# Load the category map from the JSON file
with open(category_map, 'r') as f:
    category_dict = json.load(f)

# Load the Arxiv metadata
cols = ['id', 'title', 'abstract', 'categories']
data = []
file_name = '../../arxiv_data/arxiv-metadata-oai-snapshot.json'

with open(file_name, encoding='utf-8') as f:
    for line in f:
        if line.strip():  # Check if the line is not empty or whitespace
            doc = json.loads(line)
            lst = [doc['id'], doc['title'], doc['abstract'], doc['categories']]
            data.append(lst)

df_data = pd.DataFrame(data=data, columns=cols)

# Set display options for printing in the terminal
pd.set_option('display.max_rows', 10)  # Adjust as needed
pd.set_option('display.max_columns', 4)  # Adjust as needed
pd.set_option('display.width', 1000)  # Adjust the width to fit your terminal window

# Converting the category codes to text
def get_cat_text(x):
    cat_text = ''
    # Put the codes into a list
    cat_list = x.split(' ')
    for i, item in enumerate(cat_list):
        cat_name = category_dict.get(item, 'Not available')
        # If there was no description available
        # for the category code then don't include it in the text.
        if cat_name != 'Not available':
            if i == 0:
                cat_text = cat_name
            else:
                cat_text = cat_text + ', ' + cat_name
    # Remove leading and trailing spaces
    cat_text = cat_text.strip()
    return cat_text

df_data['cat_text'] = df_data['categories'].apply(get_cat_text)

print(df_data.head())

#i = 1

#Clean text - remove \n characters with space, and trailing spaces
def clean_text(x):
    # Replace newline characters with a space
    new_text = x.replace("\n", " ")
    # Remove leading and trailing spaces
    new_text = new_text.strip()
    return new_text

# Apply the clean_text function to the 'title' and 'abstract' columns
df_data['title'] = df_data['title'].apply(clean_text)
df_data['abstract'] = df_data['abstract'].apply(clean_text)

# Create the 'prepared_text' column by concatenating 'title' and 'abstract'
df_data['prepared_text'] = df_data['title'] + ' ' + df_data['abstract']

# Create list of text strings for vectorizing
chunk_list = list(df_data['prepared_text'])

# The ids are used to create web links to each paper.
# You can access each paper directly on ArXiv using these links:
# https://arxiv.org/abs/{id}: ArXiv page for the paper
# https://arxiv.org/pdf/{id}: Direct link to download the PDF
arxiv_id_list = list(df_data['id'])
cat_list = list(df_data['cat_text'])

print(len(chunk_list))
print(len(arxiv_id_list))
print(len(cat_list))

print(chunk_list[0])

#Create the embeddings

model = SentenceTransformer("all-MiniLM-L6-v2")

# Sentences are encoded by calling model.encode()
embeddings = model.encode(chunk_list)

print(embeddings.shape)
print('Embedding length', embeddings.shape[1])


#Display one embedding
i = 1
print("chunk_list: ", chunk_list[i])
print("embeddings: ", embeddings[i])

#Save embedding vectors and dataframe
type(embeddings)

#Save array in compressed format
#np.savez_compressed('compressed_array.npz', array_data=embeddings, chunk_list=chunk_list)

np.save('embeddings.npy', embeddings)
np.save('chunk_list.npy', chunk_list)

df_data.to_csv('compressed_dataframe.csv.gz', compression='zip', index=False)

print("Embeddings and DataFrame saved successfully.")
