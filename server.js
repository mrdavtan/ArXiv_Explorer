const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer();

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the public folder
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.none());

// Render the index.ejs file
app.get('/', (req, res) => {
  res.render('index');
});

// API endpoints
app.post('/search', (req, res) => {
  const query = req.body.query;
  const numResults = req.body.numResults || 10;

  console.log(`Received search request: query=${query}, numResults=${numResults}`);

  // Execute the search script with the provided query and numResults
  exec(`python scripts/search_embeddings.py "${query}" -n ${numResults}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing search script: ${error}`);
      res.status(500).send('Error executing search script');
      return;
    }
    console.log('Search script executed successfully');
    res.send(stdout);
  });
});

app.get('/search-archive', (req, res) => {
  const archiveDir = 'search_archive';
  console.log(`Reading search archive directory: ${archiveDir}`);

  fs.readdir(archiveDir, (error, files) => {
    if (error) {
      console.error(`Error reading search archive directory: ${error}`);
      res.status(500).send('Error reading search archive directory');
      return;
    }
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    console.log(`Found ${jsonFiles.length} JSON files in search archive`);
    res.json(jsonFiles);
  });
});

app.get('/search-archive/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join('search_archive', file);
  console.log(`Reading JSON file: ${filePath}`);

  fs.readFile(filePath, 'utf8', (error, data) => {
    if (error) {
      console.error(`Error reading JSON file: ${error}`);
      res.status(500).send('Error reading JSON file');
      return;
    }
    console.log(`JSON file read successfully: ${filePath}`);
    res.json(JSON.parse(data));
  });
});

app.post('/download', (req, res) => {
  const ranks = req.body.ranks;
  console.log(`Received download request: ranks=${ranks}`);

  // Split the ranks into an array
  const rankList = ranks.split(',').map(rank => rank.trim());

  // Execute the save_full_text script with the provided rank list
  exec(`python scripts/save_full_text.py "${JSON.stringify(rankList)}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing download script: ${error}`);
      res.status(500).send('Error executing download script');
      return;
    }
    console.log('Download script executed successfully');
    res.send(stdout);
  });
});

app.post('/summarize', (req, res) => {
  const text = req.body.text;
  console.log(`Received summarize request: text=${text}`);

  // Execute the summarize script with the provided text
  exec(`python scripts/summarize.py "${text}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing summarize script: ${error}`);
      res.status(500).send('Error executing summarize script');
      return;
    }
    console.log('Summarize script executed successfully');
    res.send(stdout);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
