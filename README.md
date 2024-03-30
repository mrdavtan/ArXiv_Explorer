# ArXiv RAG/FAISS Explorer

![arxiv_rag_faiss_explorer](https://github.com/mrdavtan/ArXiv_Explorer/assets/21132073/51cfdb1c-ad16-427d-9d37-18f2178c3098)

## Introduction

The ArXiv RAG/FAISS Explorer is a basic node js app that I built for my own AI research after finding some of the alternatives a bit expensive.

This tool uses vector similarity search for exploring the extensive collection of research papers on ArXiv. Inspired by the approach outlined in tutorials by vbookshelf (https://www.kaggle.com/vbookshelf), this tool facilitates natural language queries, enabling users to sift through approximately 2.4 million papers with ease and efficiency for free. This project integrates FAISS (Facebook AI Similarity Search) and Sentence Transformers.

## Features

- **Natural Language Queries**: Empower your search with queries in plain English to find research papers that match your interests.
- **Vector Similarity Search**: Utilizes FAISS for efficient and fast search through large datasets based on vector similarity.
- **Comprehensive Database**: Access a wide array of research papers from the ArXiv dataset, updated weekly.
- **Summarization**: Leverage OpenAI models to generate concise summaries of research paper abstracts, streamlining your review process.
- **Saved Searches**: Go back to previous searches for further reading or exploration.
- **Download Papers**: Select which papers to download from the GUI.

## Getting Started

To use the ArXiv RAG/FAISS Explorer, please ensure that your environment supports GPU acceleration for optimal performance. Follow the installation instructions provided in this repository to set up the app on your system.

## How It Works

The utility processes titles and abstracts of ArXiv papers, converting them into vector embeddings. These embeddings are then indexed using FAISS, enabling the system to rapidly compare and rank the search results based on the similarity to the user's query. This method allows for a highly effective search experience, guiding users to the most relevant papers related to their query.

## Installation

```bash
# Clone this repository
git clone git@github.com:mrdavtan/ArXiv_RAG_FAISS.git
# Navigate to the project directory
cd ArXiv_RAG_FAISS
# I suggest using a virtual env.
python -m venv .venv
source .venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Make sure to have node installed
npm init -y
npm install
# start the server
node server.js
```

Open your browser and go to http://localhost:3000

## Dataset

You will need the arxiv dataset which can be found at https://www.kaggle.com/datasets/Cornell-University/arxiv
Make sure to update the path to your dataset in the search.py script.

# Usage

## Example usage

```bash
from arxiv_rag_faiss import ArxivSearch
```

## Initialize the search utility

```bash
search_utility = ArxivSearch()
```

## Perform a search

```bash
results = search_utility.search("I want to build a flying carpet using the latest in lighter than air fabrics and anti-gravity technology")
print(results)
```

For more information about how to choose an index:
https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index

## Resources and Acknowledgments

This project was inspired by and is a direct application of concepts presented in the following resources:

- [Faiss - Introduction to Similarity Search by James Briggs](https://www.youtube.com/watch?v=sKyvsdEv6rk)
- [Large Language Models with Semantic Search by Deeplearning.Ai](https://www.deeplearning.ai/short-courses/large-language-models-semantic-search/)
- [Colab Notebook on Reranking by Sentence Transformers](https://colab.research.google.com/github/UKPLab/sentence-transformers/blob/master/examples/applications/retrieve_rerank/retrieve_rerank_simple_wikipedia.ipynb)
- [Vector Databases: from Embeddings to Applications by Deeplearning.Ai](https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/)
- [Sentence Transformers Documentation](https://www.sbert.net/)

Special thanks to the ArXiv team for maintaining the dataset and providing API access, making projects like ours possible.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


