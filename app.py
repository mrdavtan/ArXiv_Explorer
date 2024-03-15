from flask import Flask, request, jsonify
from search_embeddings import search_embeddings
from save_full_text import save_full_texts, get_latest_json_file
from summarize import summarize_abstracts
from openai import ChatCompletion, OpenAI

app = Flask(__name__)

# Endpoint for searching embeddings
@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query_text = data.get('query', '')
    num_results = data.get('num_results', 10)
    search_results = search_embeddings(query_text, num_results)
    return jsonify(search_results)

# Endpoint for downloading full texts
@app.route('/download', methods=['POST'])
def download():
    data = request.json
    json_file_path = data.get('json_file_path', get_latest_json_file())
    rank_list = data.get('rank_list', [])
    downloaded_files = save_full_texts(json_file_path, rank_list)
    return jsonify({'downloaded_files': downloaded_files})

# Endpoint for summarizing abstracts
@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    json_file_path = data.get('json_file_path', get_latest_json_file())
    api_key = data.get('api_key', '')
    client = OpenAI(api_key=api_key).ChatCompletion()
    summaries = summarize_abstracts(json_file_path, client)
    return jsonify({'summaries': summaries})

if __name__ == '__main__':
    app.run(debug=True)
