from flask import Flask, request, jsonify
from search_embeddings import search_embeddings
from save_full_text import save_full_texts, get_latest_json_file
from summarize import summarize_abstracts
from openai import ChatCompletion, OpenAI
from werkzeug.exceptions import HTTPException

app = Flask(__name__)
@app.errorhandler(Exception)
def handle_exception(e):
    # Handle generic exceptions
    if isinstance(e, HTTPException):
        return jsonify(error=str(e)), e.code
    return jsonify(error=str(e)), 500

# Endpoint for searching embeddings
@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        query_text = data.get('query', '')
        num_results = data.get('num_results', 10)
        search_results = search_embeddings(query_text, num_results)
        return jsonify(search_results)
    except Exception as e:
        return jsonify(error=str(e)), 400

# Endpoint for downloading full texts
@app.route('/download', methods=['POST'])
def download():
    try:
        data = request.json
        json_file_path = data.get('json_file_path', get_latest_json_file())
        rank_list = data.get('rank_list', [])
        downloaded_files = save_full_texts(json_file_path, rank_list)
        return jsonify({'downloaded_files': downloaded_files})
    except Exception as e:
        return jsonify(error=str(e)), 400

# Endpoint for summarizing abstracts
@app.route('/summarize', methods=['POST'])
def summarize():
    try:
        data = request.json
        json_file_path = data.get('json_file_path', get_latest_json_file())
        api_key = data.get('api_key', '')
        client = OpenAI(api_key=api_key).ChatCompletion()
        summaries = summarize_abstracts(json_file_path, client)
        return jsonify({'summaries': summaries})
    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(debug=True)
