document.addEventListener('DOMContentLoaded', () => {
  // Load JSON files on page load
  fetch('/search-archive')
    .then(response => response.json())
    .then(files => {
      const select = document.getElementById('json-files');
      files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        select.appendChild(option);
      });
    });

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
      .then(response => response.text())
      .then(result => {
        document.getElementById('search-results').textContent = result;
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
  const selectedFile = document.getElementById('json-files').value;
  fetch(`/search-archive/${selectedFile}`)
    .then(response => response.json())
    .then(data => {
      const formattedResults = formatSearchResults(data);
      document.getElementById('search-results').innerHTML = formattedResults;
    });
}

function formatSearchResults(data) {
  let formattedResults = `
    <div class="search-results">
      <h3>Search Results for "${data.query}"</h3>
  `;

  data.results.forEach(result => {
    formattedResults += `
      <div class="result">
        <p><strong>Rank:</strong> ${result.Rank}</p>
        <p><strong>File:</strong> <a href="${result.File}" target="_blank">${result.File}</a></p>
        <p><strong>Categories:</strong> ${result.Categories}</p>
        <p><strong>Abstract:</strong></p>
        <p class="abstract">${result.Abstract}</p>
      </div>
      <hr>
    `;
  });

  formattedResults += `</div>`;

  return formattedResults;
}

function summarizePapers() {
  const text = document.getElementById('search-results').innerText;
  fetch('/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
    .then(response => response.text())
    .then(result => {
      document.getElementById('search-results').innerHTML = `<h3>Summary</h3><p>${result}</p>`;
    });
}

function summarizePapers() {
  const text = document.getElementById('search-results').innerText;
  fetch('/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
    .then(response => response.text())
    .then(result => {
      document.getElementById('search-results').innerHTML = `
        <div class="summary">
          <h3>Summary</h3>
          <p>${result}</p>
        </div>
      `;
    });
}
