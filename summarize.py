import os
import json
from openai import OpenAI
from glob import glob

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

def generate_title(client: OpenAI, first_sentence: str) -> str:
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

def summarize_abstract(client: OpenAI, abstract: str) -> str:
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

def summarize_abstracts(json_file_path: str, client: OpenAI) -> list:
    if not os.path.exists(json_file_path):
        raise FileNotFoundError("The specified JSON file does not exist.")

    with open(json_file_path, 'r') as file:
        data = json.load(file)

    summaries = []
    for i, result in enumerate(data['results'], start=1):
        abstract = result['Abstract']
        first_sentence = extract_title(abstract)  # Extract the first sentence from the abstract

        # Generate a title for the abstract
        title = generate_title(client, first_sentence)

        # Summarize the abstract
        summary = summarize_abstract(client, abstract)

        summaries.append({
            'index': i,
            'title': title,
            'summary': summary
        })

    return summaries

