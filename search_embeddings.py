import os
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer, CrossEncoder
import sys
import pandas as pd
import uuid
import re
import argparse

# Create an argument parser
parser = argparse.ArgumentParser(description='Semantic Search')
parser.add_argument('query', type=str, help='Query string')
parser.add_argument('-n', '--num_results', type=int, default=5, help='Number of results to retrieve')
parser.add_argument('-v', '--verbose', action='store_true', help='Print the search results')
args = parser.parse_args()

# Load the SentenceTransformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load the embeddings and metadata from the .npy file
data = np.load('embeddings.npy', allow_pickle=True).item()
embeddings = data['embeddings']
metadata_array = data['metadata']

# Convert the metadata array back to a dictionary
metadata = {row['index']: row['text'] for row in metadata_array}

# Load the compressed DataFrame
df_data = pd.read_csv('compressed_dataframe.csv.gz', compression='gzip')
print("Compressed DataFrame shape:", df_data.shape)

num_centroids = 5
embed_length = embeddings.shape[1]

quantizer = faiss.IndexFlatL2(embed_length)
index = faiss.IndexIVFFlat(quantizer, embed_length, num_centroids)

index.train(embeddings)
print("Index is trained:", index.is_trained)

index.add(embeddings)
print("Total embeddings in the index:", index.ntotal)

# Adjust the nprobe parameter for search-time performance
index.nprobe = 4

query_text = args.query
query = [query_text]

# Vectorize the query string
query_embedding = model.encode(query)

# Set the number of outputs we want
top_k = args.num_results

# Run the query
scores, index_vals = index.search(query_embedding, top_k)

print("Index values:", index_vals)
print("Scores:", scores)

# Re-ranking with CrossEncoder
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
pred_strings_list = [metadata[item] for item in index_vals[0]]
cross_input_list = [[query[0], pred_text] for pred_text in pred_strings_list]
cross_scores = cross_encoder.predict(cross_input_list)

# Preparing results
results = list(zip(index_vals[0], cross_scores, pred_strings_list))
df_sorted = pd.DataFrame(results, columns=['original_index', 'cross_scores', 'pred_text'])
df_sorted = df_sorted.sort_values(by='cross_scores', ascending=False).reset_index(drop=True)

# Create the Search_Archive directory if it doesn't exist
os.makedirs('Search_Archive', exist_ok=True)

# Generate a unique filename based on the query
filename = re.sub(r'\W+', '_', query_text) + '.json'
file_path = os.path.join('Search_Archive', filename)

# Create a list to store the search results
search_results = []

# Generate a UUID for the search
search_uuid = str(uuid.uuid4())

# Prepare the search results
for i in range(top_k):
    text = df_sorted.loc[i, 'pred_text']
    original_index = df_sorted.loc[i, 'original_index']
    cross_score = df_sorted.loc[i, 'cross_scores']

    arxiv_id = df_data.loc[original_index, 'id']
    cat_text = df_data.loc[original_index, 'categories']

    link_to_pdf = f'https://arxiv.org/pdf/{arxiv_id}'

    result = {
        'Rank': f'{i+1} (Index: {original_index}, Score: {cross_score})',
        'File': link_to_pdf,
        'Categories': cat_text,
        'Abstract': text
    }
    search_results.append(result)

# Create the JSON data
json_data = {
    'id': search_uuid,
    'query': query_text,
    'results': search_results
}

# Save the JSON data to the file
with open(file_path, 'w') as json_file:
    json.dump(json_data, json_file, indent=4)

print(f"Search results saved to: {file_path}")

# Print the search results if the verbose flag is set
if args.verbose:
    print("Retrieved texts:")
    for i in range(top_k):
        text = df_sorted.loc[i, 'pred_text']
        original_index = df_sorted.loc[i, 'original_index']
        cross_score = df_sorted.loc[i, 'cross_scores']

        arxiv_id = df_data.loc[original_index, 'id']
        cat_text = df_data.loc[original_index, 'categories']

        link_to_pdf = f'https://arxiv.org/pdf/{arxiv_id}'

        print(f"Text {i+1} (Index: {original_index}, Score: {cross_score}):")
        print('Link to PDF:', link_to_pdf)
        print('Categories:', cat_text)
        print('Abstract:', text)
        print()
