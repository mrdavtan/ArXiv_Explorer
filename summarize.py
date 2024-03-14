import os
import json
from openai import OpenAI
from glob import glob

def get_latest_json_file():
    # Get a list of all JSON files in the search_archive directory
    json_files = glob(os.path.join('search_archive', '*.json'))

    if not json_files:
        return None

    # Find the most recent file based on modification time
    latest_file = max(json_files, key=os.path.getmtime)

    return latest_file

def extract_title(abstract):
    # Extract the first sentence or a short phrase from the abstract as the title
    sentences = abstract.split('.')
    if len(sentences) > 0:
        title = sentences[0].strip()
        return title
    else:
        return ''

def main():
    # Get the latest JSON file
    json_file = get_latest_json_file()

    if json_file is None:
        print("No JSON files found in the search_archive directory.")
        return

    # Load the JSON data
    with open(json_file, 'r') as file:
        data = json.load(file)

    # Extract the abstracts and titles from the JSON data
    results = [(result['Abstract'], extract_title(result['Abstract'])) for result in data['results']]

    # Initialize the OpenAI client
    client = OpenAI()

    # Summarize each abstract
    for i, (abstract, title) in enumerate(results, start=1):
        prompt = f"""
        You will be provided with an abstract for a research paper:

        {abstract}

        Write a one sentence summary of the abstract at the level of a high school student.
        """

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo-0301",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        summary = completion.choices[0].message.content.strip()
        print(f"{i}. Title: {title}")
        print(f"   Summary: {summary}\n")

if __name__ == '__main__':
    main()
