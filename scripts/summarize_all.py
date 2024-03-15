import os
import subprocess

def main():
    search_archive_dir = '../search_archive'
    scripts_dir = '.'

    # Iterate through the files in the search_archive directory
    for file_name in os.listdir(search_archive_dir):
        if file_name.endswith('.json'):
            file_path = os.path.join(search_archive_dir, file_name)

            # Run the summarize.py script for each JSON file
            subprocess.run(['python3', os.path.join(scripts_dir, 'summarize.py'), file_path])

if __name__ == '__main__':
    main()
