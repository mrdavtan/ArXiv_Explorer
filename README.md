# ArXiv RAG FAISS Search Utility

## Introduction

The ArXiv RAG FAISS Search Utility is an innovative tool designed to harness the power of vector similarity search for exploring the extensive collection of research papers on ArXiv. Inspired by the groundbreaking approach outlined in tutorials by vbookshelf, this utility facilitates natural language queries, enabling users to sift through approximately 2.4 million papers with unparalleled ease and efficiency. Our project stands on the shoulders of giants, integrating cutting-edge technologies like FAISS (Facebook AI Similarity Search) and Sentence Transformers to revolutionize how research is conducted and accessed.

## Features

- **Natural Language Queries**: Empower your search with queries in plain English to find research papers that match your interests.
- **Vector Similarity Search**: Utilizes FAISS for efficient and fast search through large datasets based on vector similarity.
- **Comprehensive Database**: Access a wide array of research papers from the ArXiv dataset, updated weekly.
- **Summarization**: Leverage OpenAI models to generate concise summaries of research paper abstracts, streamlining your review process.

## Getting Started

To use the ArXiv RAG FAISS Search Utility, please ensure that your environment supports GPU acceleration (e.g., P100) for optimal performance. Follow the installation instructions provided in this repository to set up the utility on your system.

## How It Works

The utility processes titles and abstracts of ArXiv papers, converting them into vector embeddings. These embeddings are then indexed using FAISS, enabling the system to rapidly compare and rank the search results based on the similarity to the user's query. This method allows for a highly effective search experience, guiding users to the most relevant papers related to their query.

## Installation

```bash
# Clone this repository
git clone <repository-url>
# Navigate to the project directory
cd <project-directory>
# Install dependencies
pip install -r requirements.txt
```

# Usage

## Example usage
from arxiv_rag_faiss import ArxivSearch

## Initialize the search utility

```bash
search_utility = ArxivSearch()
```

## Perform a search

```bash
results = search_utility.search("I want to build an invisibility cloak like the one in Harry Potter")
print(results)
```

## Resources and Acknowledgments

This project was inspired by and is a direct application of concepts presented in the following resources:

- [Faiss - Introduction to Similarity Search by James Briggs](https://www.youtube.com/watch?v=sKyvsdEv6rk)
- [Large Language Models with Semantic Search by Deeplearning.Ai](https://www.deeplearning.ai/short-courses/large-language-models-semantic-search/)
- [Colab Notebook on Reranking by Sentence Transformers](https://colab.research.google.com/github/UKPLab/sentence-transformers/blob/master/examples/applications/retrieve_rerank/retrieve_rerank_simple_wikipedia.ipynb)
- [Vector Databases: from Embeddings to Applications by Deeplearning.Ai](https://www.deeplearning.ai/short-courses/vector-databases-embeddings-applications/)
- [Sentence Transformers Documentation](https://www.sbert.net/)

Special thanks to the ArXiv team for maintaining the dataset and providing API access, making projects like ours possible.

## Contributing

Contributions to the ArXiv RAG FAISS Search Utility are welcome! Please read our contributing guidelines for more information on how you can contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


