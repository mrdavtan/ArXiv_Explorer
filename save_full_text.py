import os
import json
import sys
import re
import requests

def sanitize_title(title):
    # Remove special characters and replace spaces with underscores
    sanitized_title = re.sub(r'[^a-zA-Z0-9\s]', '', title)
    sanitized_title = re.sub(r'\s+', '_', sanitized_title)
    return sanitized_title

def download_pdf(url, filename):
    response = requests.get(url)
    with open(filename, 'wb') as file:
        file.write(response.content)

def main(json_file, rank_list):
    # Load the JSON file
    json_path = os.path.join('search_archive', json_file)
    with open(json_path, 'r') as file:
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
            # Extract the PDF URL and title
            pdf_url = result['File']
            title = result['Abstract'].split('.')[0]  # Use the first sentence as the title

            # Sanitize the title
            sanitized_title = sanitize_title(title)

            # Extract the arXiv index from the PDF URL
            arxiv_index = pdf_url.split('/')[-1].split('.')[0]

            # Create the filename with the sanitized title and arXiv index
            filename = f"{sanitized_title}_{arxiv_index}.pdf"

            # Download the PDF
            pdf_path = os.path.join('pdf_archive', filename)
            download_pdf(pdf_url, pdf_path)
            print(f"Downloaded: {filename}")
        else:
            print(f"Result with rank {rank} not found.")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python save_full_text.py <json_file> <rank_list>")
        sys.exit(1)

    json_file = sys.argv[1]
    rank_list = json.loads(sys.argv[2])

    main(json_file, rank_list)
