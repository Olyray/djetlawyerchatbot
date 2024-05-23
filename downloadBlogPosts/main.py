#!/usr/bin/env python3
import json
import os
import pdfkit
import requests
from bs4 import BeautifulSoup

# Load URLs from a JSON file
with open('urls.json', 'r') as json_file:
    urls = json.load(json_file)

# Directory where PDFs will be saved
pdf_directory = 'blog_pdfs'
os.makedirs(pdf_directory, exist_ok=True)

# JSON object to map each downloaded PDF to its URL
downloaded_pdfs = {}

for url in urls:
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    article = soup.find('article')
    if article:
        pdf_filename = url.split("/")[-2] + '.pdf'
        pdf_filename = pdf_filename.replace('%20', '_').replace(' ', '_')
        pdf_filepath = os.path.join(pdf_directory, pdf_filename)
        pdfkit.from_string(str(article), pdf_filepath)
        downloaded_pdfs[pdf_filepath] = url
        print(f"Saved blog post as PDF: {pdf_filepath}")
    else:
        print(f"Article tag not found in {url}")

# Save the mapping of URLs to PDF filenames as a JSON file
with open('downloaded_pdfs.json', 'w') as json_file:
    json.dump(downloaded_pdfs, json_file, indent=4)

print("All available blog posts have been saved as PDFs.")

