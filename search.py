#!/bin/env python3
import pandas as pd
import numpy as np
import os
import json
import re
import openai

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
