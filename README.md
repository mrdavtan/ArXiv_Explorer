# ArXiv RAG/FAISS Explorer

![arxiv_rag_faiss_explorer](https://github.com/mrdavtan/ArXiv_Explorer/assets/21132073/51cfdb1c-ad16-427d-9d37-18f2178c3098)

## Background

The ArXiv RAG/FAISS Explorer is a node app with a few convenience features for my own research; mainly similarity search, ranking, summarizing (OpenAI API) for quickly browsing related AI/ML topics/literature. The dataset is free and incredibly powerful. Use it for good. To read more about the Open Archives Initiative: https://info.arxiv.org/help/oa/index.html

There is a training step involved, so if you're familiar with python and node.js, you should be able to get this to run fairly easily. I've ironed out some of the issues from the original training instructions. Future work: paper insights and a system to update to the latest dataset automatically.

## Description

This tool uses vector similarity search for exploring the extensive collection of research papers on ArXiv. The training steps originated from vbookshelf (https://www.kaggle.com/vbookshelf). This tool facilitates natural language queries, enabling users to sift through approximately 2.4 million papers with ease and efficiency for free. This project integrates FAISS (Facebook AI Similarity Search) and Sentence Transformers.

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
# I suggest using a virtual env. for the training.
python -m venv .venv
source .venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Make sure to have node installed
npm init -y
npm install
```

## Dataset

You will need the arxiv dataset which can be found at https://www.kaggle.com/datasets/Cornell-University/arxiv
It's about 1.3Gb and you will need to extract it and place it in the scripts folder. i
Run create_embeddings.py from the scripts folder, and then go outside and hug a deer. Drink matcha tea. Take a cold shower. Make a sandwich. Call your parents. The training step took about an hour on a RTX4080 GPU.
The process will create a file called 'compressed_dataframe.csv.gz' and one called 'embeddings.npy'.


# Usage

go to the root of the project and run

'''bash
node server.js
```

Enter some keywords in the search bar and hit submit.
It can take up to a minute based on the number of searches and your GPU. I suggest keeping the number of results to 10 or less.


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


