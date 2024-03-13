import os
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer

# Load the SentenceTransformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load the embeddings and metadata from the .npy file
data = np.load('embeddings.npy', allow_pickle=True).item()
embeddings = data['embeddings']
metadata_array = data['metadata']

# Convert the metadata array back to a dictionary
metadata = {row['index']: row['text'] for row in metadata_array}

embed_length = embeddings.shape[1]
index = faiss.IndexFlatL2(embed_length)

# Check if the index is trained.
# No training needed when using greedy search i.e., IndexFlatL2
print("Index is trained:", index.is_trained)

index.add(embeddings)

# Check the total number of embeddings in the index
print("Total embeddings in the index:", index.ntotal)

query_text = """
I want to create a knowledge graph database in which the nodes can change context, complemented by RAG and an LLM
"""

query = [query_text]

# Vectorize the query string
query_embedding = model.encode(query)

# Set the number of outputs we want
top_k = 3

# Run the query
scores, index_vals = index.search(query_embedding, top_k)

print("Index values:", index_vals)
print("Scores:", scores)

pred_indexes = index_vals[0]

i = 0
chunk_index = pred_indexes[i]
text = metadata[chunk_index]
print("Retrieved text:")
print(text)
