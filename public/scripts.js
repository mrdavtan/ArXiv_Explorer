

document.addEventListener('DOMContentLoaded', () => {
  // Load JSON files on page load
  loadJsonFiles();
  loadSummaryFiles();

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
      displayResults(data.summaryResults, 'summary');
      displayResults(data.searchResults.results, 'abstract');
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
  fetch('/search-archive')
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

function loadSummaryFiles() {
  fetch('/summary-archive')
    .then(response => response.json())
    .then(files => {
      const select = document.getElementById('summary-files');
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
  fetch(`/search-archive/${selectedFile}`)
    .then(response => response.json())
    .then(data => {
      displayResults(data.results, 'abstract');
    });
}

function loadSummaryFile() {
  const selectedFile = document.getElementById('summary-files').value;
  fetch(`/summary-archive/${selectedFile}`)
    .then(response => response.json())
    .then(data => {
      displayResults(data, 'summary');
    });
}

function summarizeResults(results) {
  // Implement the logic to summarize the results using the summarize.py script
  // You can send a request to the server with the results and receive the summaries
  // For demonstration purposes, let's assume the summaries are generated instantly
  const summaries = results.map(result => ({
    Rank: result.Rank,
    File: result.File,
    Categories: result.Categories,
    Summary: 'This is a placeholder summary for demonstration purposes.'
  }));
  return summaries;
}

function displayResults(results, type) {
  const container = document.getElementById('results-container');
  let html = '';
  if (type === 'summary') {
    html = `
      <h3>Summary Results</h3>
      ${results.map(result => `
        <div class="result">
          <p><strong>Rank:</strong> ${result.Rank}</p>
          <p><strong>File:</strong> <a href="${result.File}" target="_blank">${result.File}</a></p>
          <p><strong>Categories:</strong> ${result.Categories}</p>
          <p class="summary">${result.Summary}</p>
        </div>
        <hr>
      `).join('')}
    `;
  } else if (type === 'abstract') {
    html = `
      <h3>Abstract Results</h3>
      ${results.map(result => `
        <div class="result">
          <p><strong>Rank:</strong> ${result.Rank}</p>
          <p><strong>File:</strong> <a href="${result.File}" target="_blank">${result.File}</a></p>
          <p><strong>Categories:</strong> ${result.Categories}</p>
          <p class="abstract">${result.Abstract}</p>
        </div>
        <hr>
      `).join('')}
    `;
  }
  container.innerHTML = html;
}
