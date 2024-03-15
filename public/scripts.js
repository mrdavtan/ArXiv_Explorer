let currentView = 'summary';
let searchResults = [];
let summaryResults = [];

document.addEventListener('DOMContentLoaded', () => {
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

function loadJsonFiles() {
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
    });
}

function loadJsonFile() {
  const selectedFile = document.getElementById('json-files').value;
  if (selectedFile) {
    const endpoint = currentView === 'summary' ? `/summary-archive/${selectedFile}` : `/search-archive/${selectedFile}`;
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        if (currentView === 'summary') {
          summaryResults = data;
        } else {
          searchResults = data.results;
        }
        displayResults();
      })
      .catch(error => {
        console.error('Error loading JSON file:', error);
      });
  } else {
    alert('Please select a JSON file from the dropdown.');
  }
}

function toggleView() {
  currentView = currentView === 'summary' ? 'abstract' : 'summary';
  const toggleButton = document.getElementById('toggle-view-btn');
  toggleButton.textContent = currentView === 'summary' ? 'Abstract' : 'Summary';
  loadJsonFiles();
  displayResults();
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


