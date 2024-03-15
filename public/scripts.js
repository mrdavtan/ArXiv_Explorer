let currentView = 'summary';
let searchResults = [];
let summaryResults = [];

document.addEventListener('DOMContentLoaded', () => {
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

function toggleView() {
  currentView = currentView === 'summary' ? 'abstract' : 'summary';
  displayResults();
}

function displayResults() {
  const container = document.getElementById('results-container');
  let html = '';
  if (currentView === 'summary') {
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
  } else if (currentView === 'abstract') {
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
  }
  container.innerHTML = html;
}
