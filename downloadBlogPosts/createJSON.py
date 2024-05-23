#!/usr/bin/env python3
import json
import os

# The directory where the PDFs are saved
pdf_directory = './blog_pdfs'

# Load URLs from the JSON file
with open('./urls.json', 'r') as json_file:
    urls = json.load(json_file)

# Load the existing mapping from downloaded_pdfs.json if it exists
downloaded_pdfs_path = './downloaded_pdfs.json'
if os.path.exists(downloaded_pdfs_path):
    with open(downloaded_pdfs_path, 'r') as json_file:
        downloaded_pdfs = json.load(json_file)
else:
    downloaded_pdfs = {}

# Mapping filenames to URLs
for filename in os.listdir(pdf_directory):
    # Assuming the filename minus '.pdf' is the slug of the URL
    slug = filename.replace('.pdf', '')
    # Find the URL ending with the slug
    url = next((url for url in urls if slug in url), None)
    if url:
        # Map the file path with the corresponding URL
        downloaded_pdfs[os.path.join(pdf_directory, filename)] = url

# Save the updated mapping to downloaded_pdfs.json
with open(downloaded_pdfs_path, 'w') as json_file:
    json.dump(downloaded_pdfs, json_file, indent=4)

# Returning the updated mapping content
print('Mapping complete')