import os
import json

# Set the paths for the source and destination folders
summary_archive_path = "./summary_archive"
search_archive_path = "./search_archive"

# Iterate through each file in the summary_archive folder
for filename in os.listdir(summary_archive_path):
    if filename.endswith(".json"):
        # Open the JSON file in the summary_archive folder
        with open(os.path.join(summary_archive_path, filename), "r") as file:
            try:
                summary_data = json.load(file)
            except json.JSONDecodeError:
                print(f"Error: Invalid JSON format in file {filename}")
                continue

            # Extract the UUID and results from the summary data
            uuid = summary_data.get("id")
            summary_results = summary_data.get("results", [])

            # Find the matching JSON file in the search_archive folder
            for search_filename in os.listdir(search_archive_path):
                if search_filename.endswith(".json"):
                    # Open the JSON file in the search_archive folder
                    with open(os.path.join(search_archive_path, search_filename), "r") as file:
                        try:
                            search_data = json.load(file)
                        except json.JSONDecodeError:
                            print(f"Error: Invalid JSON format in file {search_filename}")
                            continue

                        # Check if the UUID matches
                        if search_data.get("id") == uuid:
                            search_results = search_data.get("results", [])

                            # Update or create the Title field in each search result
                            for i in range(len(search_results)):
                                if i < len(summary_results) and "Title" in summary_results[i]:
                                    search_results[i]["Title"] = summary_results[i]["Title"]
                                else:
                                    search_results[i]["Title"] = ""

                            # Write the updated data back to the search file
                            with open(os.path.join(search_archive_path, search_filename), "w") as file:
                                json.dump(search_data, file, indent=4)

                            break  # Exit the inner loop since a match was found

