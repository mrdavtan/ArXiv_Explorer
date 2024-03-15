function searchPapers() {
    const query = document.getElementById('search-query').value;
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.json())
    .then(data => {
        const resultsElement = document.getElementById('search-results');
        resultsElement.innerHTML = JSON.stringify(data, null, 2);
    });
}

function downloadPapers() {
    const ranks = document.getElementById('download-ranks').value.split(',').map(Number);
    fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rank_list: ranks })
    })
    .then(response => response.json())
    .then(data => {
        const resultsElement = document.getElementById('download-results');
        resultsElement.innerHTML = JSON.stringify(data, null, 2);
    });
}

window.onload = function loadJsonFiles() {
    fetch('/load_json_files')
    .then(response => response.json())
    .then(data => {
        const dropdown = document.getElementById('json-files');
        dropdown.innerHTML = '';
        data.files.forEach(file => {
            const option = document.createElement('option');
            option.textContent = file;
            dropdown.appendChild(option);
        });
    });
}

function summarizeAbstracts() {
    const filePath = document.getElementById('json-files-dropdown').value;
    fetch('/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ json_file_path: filePath })
    })
    .then(response => response.json())
    .then(data => {
        const resultsElement = document.getElementById('summarize-results');
        resultsElement.innerHTML = '';
        data.summaries.forEach(summary => {
            const p = document.createElement('p');
            p.textContent = summary;
            resultsElement.appendChild(p);
            const br = document.createElement('br');
            resultsElement.appendChild(br);
        });
    });
}
