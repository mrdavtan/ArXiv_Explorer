import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import json

# Load the category map from the JSON file
with open('category_map.json', 'r') as f:
    category_dict = json.load(f)

# Load the Arxiv metadata
cols = ['id', 'title', 'abstract', 'categories']
data = []
file_name = '../../db/arxiv_data/arxiv-metadata-oai-snapshot.json'

with open(file_name, encoding='utf-8') as f:
    for line in f:
        if line.strip():  # Check if the line is not empty or whitespace
            doc = json.loads(line)
            lst = [doc['id'], doc['title'], doc['abstract'], doc['categories']]
            data.append(lst)

df_data = pd.DataFrame(data=data, columns=cols)

# Converting the category codes to text
def get_cat_text(x):
    cat_text = ''
    cat_list = x.split(' ')
    for i, item in enumerate(cat_list):
        cat_name = category_dict.get(item, 'Not available')
        if cat_name != 'Not available':
            if i == 0:
                cat_text = cat_name
            else:
                cat_text = cat_text + ', ' + cat_name
    cat_text = cat_text.strip()
    return cat_text

df_data['cat_text'] = df_data['categories'].apply(get_cat_text)

# Clean text - remove \n characters with space, and trailing spaces
def clean_text(x):
    new_text = x.replace("\n", " ")
    new_text = new_text.strip()
    return new_text

df_data['title'] = df_data['title'].apply(clean_text)
df_data['abstract'] = df_data['abstract'].apply(clean_text)

df_data['prepared_text'] = df_data['title'] + ' ' + df_data['abstract']

df_data.to_csv('compressed_dataframe.csv.gz', compression='gzip', index=False)

chunk_list = list(df_data['prepared_text'])

# Create the embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunk_list)

# Create a dictionary to store the metadata
metadata = {i: chunk for i, chunk in enumerate(chunk_list)}

# Convert the metadata dictionary to a structured numpy array
metadata_array = np.array(list(metadata.items()), dtype=[('index', int), ('text', object)])

# Save the embeddings and metadata as a single .npy file
np.save('embeddings.npy', {'embeddings': embeddings, 'metadata': metadata_array})

print("Embeddings and metadata saved successfully.")
