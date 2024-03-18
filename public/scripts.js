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
        displayStaticResults();
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

      const filePromises = files.map(file => {
        const fileEndpoint = currentView === 'summary' ? `/summary-archive/${file}` : `/search-archive/${file}`;
        return fetch(fileEndpoint).then(response => response.json());
      });

      Promise.all(filePromises)
        .then(jsonDataList => {
          jsonDataList.forEach((jsonData, index) => {
            const option = document.createElement('option');
            option.value = files[index];
            option.textContent = files[index];
            select.appendChild(option);

            if (jsonData.id === selectedFileUUID) {
              select.value = files[index];
              console.log('Matching file found:', files[index]);
            }
          });
        })
        .catch(error => {
          console.error('Error loading JSON files:', error);
        });
    });
}

function logDropdownOptions() {
  const select = document.getElementById('json-files');
  console.log('Dropdown options:');
  for (let i = 0; i < select.options.length; i++) {
    console.log(select.options[i].value);
  }
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

function displayStaticResults() {
  const container = document.getElementById('results-container');

  let html = '';

  if (currentView === 'summary') {
    if (summaryResults.length > 0) {
      html = `
        <h3>Summary Results</h3>
        ${summaryResults.map(result => `
          <div class="result">
            <h2>${result.Title}</h2>
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
            <h2>${result.Title}</h2>
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

function displayResults() {
  const container = document.getElementById('results-container');

  let html = '';

  if (currentView === 'summary') {
    if (summaryResults.results && summaryResults.results.length > 0) {
      html = `
        <h3>Summary Results</h3>
        ${summaryResults.results.map(result => `
          <div class="result">
            <h2>${result.Title}</h2>
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
            <h2>${result.Title}</h2>
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
