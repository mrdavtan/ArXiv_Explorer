import os
import json
import sys
import re
import requests
from glob import glob

def sanitize_title(title):
    # Remove special characters and replace spaces with underscores
    sanitized_title = re.sub(r'[^a-zA-Z0-9\s]', '', title)
    sanitized_title = re.sub(r'\s+', '_', sanitized_title)
    return sanitized_title

def download_pdf(url, filename):
    response = requests.get(url)
    with open(filename, 'wb') as file:
        file.write(response.content)

def get_latest_json_file():
    # Get a list of all JSON files in the search_archive directory
    json_files = glob(os.path.join('search_archive', '*.json'))

    if not json_files:
        return None

    # Find the most recent file based on modification time
    latest_file = max(json_files, key=os.path.getmtime)

    return latest_file

def extract_short_title(abstract):
    # Extract the first sentence or a short phrase from the abstract
    sentences = abstract.split('.')
    if len(sentences) > 0:
        short_title = sentences[0].strip()
        return short_title
    else:
        return ''

def main(json_file, rank_list):
    # Load the JSON file
    with open(json_file, 'r') as file:
        data = json.load(file)

    # Extract the search results
    search_results = data['results']

    # Create the pdf_archive directory if it doesn't exist
    os.makedirs('pdf_archive', exist_ok=True)

    # Iterate through the specified ranks
    for rank in rank_list:
        # Find the result with the corresponding rank
        result = next((r for r in search_results if int(r['Rank'].split()[0]) == rank), None)

        if result:
            # Extract the PDF URL, arXiv index, and abstract
            pdf_url = result['File']
            arxiv_index = pdf_url.split('/')[-1]
            abstract = result['Abstract']

            # Extract a short title from the abstract
            short_title = extract_short_title(abstract)

            # Sanitize the short title
            sanitized_title = sanitize_title(short_title)

            # Truncate the sanitized title if it exceeds a certain length
            max_title_length = 50
            if len(sanitized_title) > max_title_length:
                sanitized_title = sanitized_title[:max_title_length]

            # Create the filename with the sanitized title and arXiv index
            filename = f"{sanitized_title}_{arxiv_index}"

            # Download the PDF
            pdf_path = os.path.join('pdf_archive', filename)
            download_pdf(pdf_url, pdf_path)
            print(f"Downloaded: {filename}")
        else:
            print(f"Result with rank {rank} not found.")

if __name__ == '__main__':
    if len(sys.argv) == 2:
        # If only the rank list is provided, find the most recent JSON file
        rank_list = json.loads(sys.argv[1])
        json_file = get_latest_json_file()
        if json_file is None:
            print("No JSON files found in the search_archive directory.")
            sys.exit(1)
    elif len(sys.argv) == 3:
        # If both the JSON file and rank list are provided
        json_file = os.path.join('search_archive', sys.argv[1])
        rank_list = json.loads(sys.argv[2])
    else:
        print("Usage: python save_full_text.py [<json_file>] <rank_list>")
        sys.exit(1)

    main(json_file, rank_list)
