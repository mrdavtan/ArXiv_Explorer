import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load the SentenceTransformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Get the size of the file in bytes
file_size_bytes = os.path.getsize('compressed_array.npz')

# Convert bytes to megabytes
file_size_mb = file_size_bytes / (1024 * 1024)
print("File size:", file_size_mb, "MB")

# Load the compressed array
loaded_data = np.load('compressed_array.npz', allow_pickle=True)
embeddings = loaded_data['array_data']
chunk_list = loaded_data['chunk_list']

embed_length = embeddings.shape[1]
index = faiss.IndexFlatL2(embed_length)

# Check if the index is trained.
# No training needed when using greedy search i.e., IndexFlatL2
print("Index is trained:", index.is_trained)

index.add(embeddings)

# Check the total number of embeddings in the index
index.ntotal

query_text = """
I want to create a knowledge graph database in which the nodes can change context, complemented by RAG and an LLM
"""

query = [query_text]

# Vectorize the query string
query_embedding = model.encode(query)

# Set the number of outputs we want
top_k = 3

# Run the query
# index_vals refers to the chunk_list index values
scores, index_vals = index.search(query_embedding, top_k)

print(index_vals)
print(scores)

pred_indexes = index_vals[0]

i = 0
chunk_index = pred_indexes[i]
text = chunk_list[chunk_index]
print(text)
