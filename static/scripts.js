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

window.onload = function() {
    console.log('window.onload called');
    fetch('/load_json_files')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received response from /load_json_files: ', data);
        const dropdown = document.getElementById('json-files');
        dropdown.innerHTML = ''; // Clear the dropdown
        data.files.forEach(file => {
            const option = document.createElement('option');
            option.text = file;
            dropdown.add(option);
        });
    })
    .catch(e => {
        console.log('There was a problem with the fetch operation: ' + e.message);
    });
}

function loadJsonFiles() {
    console.log('loadJsonFiles called');
    const filePath = document.getElementById('json-files').value;
    fetch('/load_json_files', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ json_file_path: filePath })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const resultsElement = document.getElementById('search-results');
        resultsElement.innerHTML = '';
        data.forEach(item => {
            const p = document.createElement('p');
            p.textContent = JSON.stringify(item, null, 2);
            resultsElement.appendChild(p);
        });
    })
    .catch(e => {
        console.log('There was a problem with the fetch operation: ' + e.message);
    });
}

function summarizeAbstracts() {
    const filePath = document.getElementById('json-files').value;
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
