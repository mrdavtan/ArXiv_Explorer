import os
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer, CrossEncoder
import sys
import pandas as pd

# Load the SentenceTransformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load the embeddings and metadata from the .npy file
data = np.load('embeddings.npy', allow_pickle=True).item()
embeddings = data['embeddings']
metadata_array = data['metadata']

# Convert the metadata array back to a dictionary
metadata = {row['index']: row['text'] for row in metadata_array}

num_centroids = 5
embed_length = embeddings.shape[1]

quantizer = faiss.IndexFlatL2(embed_length)
index = faiss.IndexIVFFlat(quantizer, embed_length, num_centroids)

index.train(embeddings)
print("Index is trained:", index.is_trained)

index.add(embeddings)
print("Total embeddings in the index:", index.ntotal)

# Adjust the nprobe parameter for search-time performance
index.nprobe = 5

# Get the query string from the command line argument
if len(sys.argv) < 2:
    print("Please provide a query string as a command line argument.")
    sys.exit(1)
query_text = sys.argv[1]

query = [query_text]

# Vectorize the query string
query_embedding = model.encode(query)

# Set the number of outputs we want
top_k = 10

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

# Load the full dataset DataFrame (assuming it's stored in a CSV file named 'full_dataset.csv')
df_data = pd.read_csv('compressed_dataframe.csv.gz', compression='gzip')
print(df_data.shape)

# Set the number of results to display
num_results = 10

# Printing top results
print("Retrieved texts:")
for i in range(num_results):
    text = df_sorted.loc[i, 'pred_text']
    original_index = df_sorted.loc[i, 'original_index']
    cross_score = df_sorted.loc[i, 'cross_scores']

    arxiv_id = df_data.loc[original_index, 'id']
    cat_text = df_data.loc[original_index, 'cat_text']

    # Create the link to the research paper PDF
    link_to_pdf = f'https://arxiv.org/pdf/{arxiv_id}'

    print(f"Text {i+1} (Index: {original_index}, Score: {cross_score}):")
    print('Link to PDF:', link_to_pdf)
    print('Categories:', cat_text)
    print('Abstract:', text)
    print()
