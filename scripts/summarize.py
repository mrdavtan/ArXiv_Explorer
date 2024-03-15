import os
import json
from openai import OpenAI
from glob import glob
import re
from datetime import datetime

def get_latest_json_file():
    json_files = glob(os.path.join('search_archive', '*.json'))
    if not json_files:
        return None
    latest_file = max(json_files, key=os.path.getmtime)
    return latest_file

def extract_title(abstract):
    sentences = abstract.split('.')
    if sentences:
        first_sentence = sentences[0].strip()
        return first_sentence
    else:
        return ''

def generate_title(client, first_sentence):
    prompt = f"""
    Given the first sentence of an abstract of a research paper, identify the official title and truncate any other text.
    Title: {first_sentence}
    """
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo-0301",
        messages=[
            {"role": "system", "content": "Generate a concise and descriptive title for the following abstract."},
            {"role": "user", "content": prompt}
        ]
    )
    title = completion.choices[0].message.content.strip()
    return title

def summarize_abstract(client, abstract):
    prompt = f"""
    Write a one sentence summary of the abstract at the level of a very smart high school student or a 2nd year college student.
    {abstract}
    """
    completion = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[
            {"role": "system", "content": "Summarize the abstract in simple terms."},
            {"role": "user", "content": prompt}
        ]
    )
    summary = completion.choices[0].message.content.strip()
    return summary

def save_summary(query, summary_results):
    current_date = datetime.now().strftime('%Y%m%d%H%M%S')
    filename = re.sub(r'\W+', '_', query) + '_' + current_date + '.json'
    file_path = os.path.join('summary_archive', filename)

    os.makedirs('summary_archive', exist_ok=True)

    with open(file_path, 'w') as json_file:
        json.dump(summary_results, json_file, indent=4)

    print(f"Summary saved to: {file_path}")

def main():
    client = OpenAI()  # Initialize the OpenAI client

    json_file = get_latest_json_file()
    if json_file is None:
        print("No JSON files found in the search_archive directory.")
        return

    with open(json_file, 'r') as file:
        data = json.load(file)

    query = data['query']
    summary_results = []

    for result in data['results']:
        abstract = result['Abstract']
        rank = result['Rank']
        category = result['Categories']
        file = result['File']

        first_sentence = extract_title(abstract)  # Extract the first sentence from the abstract
        title = generate_title(client, first_sentence)  # Generate a title for the abstract
        summary = summarize_abstract(client, abstract)  # Summarize the abstract

        summary_result = {
            'Rank': rank,
            'File': file,
            'Categories': category,
            'Title': title,
            'Summary': summary
        }
        summary_results.append(summary_result)

    save_summary(query, summary_results)

if __name__ == '__main__':
    main()
