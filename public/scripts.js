let currentView = 'summary';
let searchResults = [];
let summaryResults = [];
let selectedFileUUID = '';

console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  loadJsonFiles();

  // Search form submission
  document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    const numResults = document.getElementById('num-results').value;
    fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, numResults })
    })
      .then(response => response.json())
      .then(data => {
        searchResults = data.searchResults.results;
        summaryResults = data.summaryResults;
        displayResults();
      });
  });

  // Download form submission
  document.getElementById('download-form').addEventListener('submit', event => {
    event.preventDefault();
    const ranks = document.getElementById('download-ranks').value;
    fetch('/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ranks })
    })
      .then(response => response.text())
      .then(result => {
        document.getElementById('download-results').textContent = result;
      });
  });
});

function loadJsonFile() {
  console.log('loadJsonFile function called');
  const selectedFile = document.getElementById('json-files').value;
  console.log('Selected file:', selectedFile);

  if (selectedFile) {
    const endpoint = currentView === 'summary' ? `/summary-archive/${selectedFile}` : `/search-archive/${selectedFile}`;
    console.log('Fetching data from:', endpoint);

    fetch(endpoint)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Loaded JSON data:', data);

        if (data.id) {
          selectedFileUUID = data.id;
          console.log('Extracted UUID:', selectedFileUUID);
        } else {
          console.log('No UUID found in the loaded JSON data');
        }

        if (currentView === 'summary') {
          searchResults = []; // Clear previous search results
          summaryResults = data.results;
        } else {
          searchResults = data.results;
          summaryResults = []; // Clear previous summary results
        }
        displayResults();
      })
      .catch(error => {
        console.error('Error loading JSON file:', error);
      });
  }
}


function loadJsonFiles() {
  console.log('loadJsonFiles function called');
  const endpoint = currentView === 'summary' ? '/summary-archive' : '/search-archive';
  fetch(endpoint)
    .then(response => response.json())
    .then(files => {
      const select = document.getElementById('json-files');
      select.innerHTML = '';
      files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        select.appendChild(option);
      });

      console.log('Selected file UUID:', selectedFileUUID);

      // Set the selected file based on the stored UUID
      if (selectedFileUUID) {
        const selectedFile = files.find(file => file.includes(selectedFileUUID));
        if (selectedFile) {
          select.value = selectedFile;
          console.log('Matching file found:', selectedFile);
        } else {
          console.log('No matching file found for UUID:', selectedFileUUID);
        }
      }
    });
}

function toggleView() {
  console.log('toggleView function called');
  currentView = currentView === 'summary' ? 'abstract' : 'summary';
  const toggleButton = document.getElementById('toggle-view-btn');
  toggleButton.textContent = currentView === 'summary' ? 'Abstract' : 'Summary';
  loadJsonFiles();

  // Trigger the loadJsonFile function after a short delay to allow the dropdown to update
  setTimeout(() => {
    loadJsonFile();
  }, 100);
}

function displayResults() {
  const container = document.getElementById('results-container');
  let html = '';
  if (currentView === 'summary') {
    if (summaryResults.length > 0) {
      html = `
        <h3>Summary Results</h3>
        ${summaryResults.map(result => `
          <div class="result">
            <p><strong>Rank:</strong> ${result.Rank}</p>
            <p><strong>File:</strong> <a href="${result.File}" target="_blank">${result.File}</a></p>
            <p><strong>Categories:</strong> ${result.Categories}</p>
            <p class="summary">${result.Summary}</p>
          </div>
          <hr>
        `).join('')}
      `;
    } else {
      html = '<p>No summary results available.</p>';
    }
  } else if (currentView === 'abstract') {
    if (searchResults.length > 0) {
      html = `
        <h3>Abstract Results</h3>
        ${searchResults.map(result => `
          <div class="result">
            <p><strong>Rank:</strong> ${result.Rank}</p>
            <p><strong>File:</strong> <a href="${result.File}" target="_blank">${result.File}</a></p>
            <p><strong>Categories:</strong> ${result.Categories}</p>
            <p class="abstract">${result.Abstract}</p>
          </div>
          <hr>
        `).join('')}
      `;
    } else {
      html = '<p>No abstract results available.</p>';
    }
  }
  container.innerHTML = html;
}


