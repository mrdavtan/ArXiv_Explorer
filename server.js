const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const app = express();
const upload = multer();
const { execFile } = require('child_process');
const path = require('path');

// Load the configuration file
const config = require('./config.json');

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Set the base directory path
const baseDir = path.join(__dirname, config.baseDir);

app.use('/scripts', express.static(path.join(baseDir, config.scriptsDir)));
const searchArchiveDir = path.join(baseDir, config.searchArchiveDir);
const summaryArchiveDir = path.join(baseDir, config.summaryArchiveDir);

// Serve static files from the public folder
app.use(express.static(path.join(baseDir, config.publicDir)));

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

  const searchScriptPath = path.join(baseDir, config.scriptsDir, 'search_embeddings.py');
  const searchArgs = [searchScriptPath, query.replace(/"/g, '\\"'), '-n', String(numResults)];

  execFile('/usr/bin/python3', searchArgs, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing search script: ${error}`);
      console.error(`Standard Error: ${stderr}`);
      res.status(500).send('Error executing search script');
      return;
    }
    console.log('Search script executed successfully');
    console.log(`Standard Output: ${stdout}`);

    const latestSearchFile = getLatestJsonFile(searchArchiveDir);
    if (latestSearchFile) {
      fs.readFile(latestSearchFile, 'utf8', (error, data) => {
        if (error) {
          console.error(`Error reading search JSON file: ${error}`);
          res.status(500).send('Error reading search JSON file');
          return;
        }
        const searchResults = JSON.parse(data);

        const summarizeScriptPath = path.join(baseDir, config.scriptsDir, 'summarize.py');
        const summarizeArgs = [summarizeScriptPath, latestSearchFile];

        execFile('/usr/bin/python3', summarizeArgs, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing summarize script: ${error}`);
            console.error(`Standard Error: ${stderr}`);
            res.status(500).send('Error executing summarize script');
            return;
          }
          console.log('Summarize script executed successfully');
          console.log(`Standard Output: ${stdout}`);

          const latestSummaryFile = getLatestJsonFile(summaryArchiveDir);
          if (latestSummaryFile) {
            fs.readFile(latestSummaryFile, 'utf8', (error, data) => {
              if (error) {
                console.error(`Error reading summary JSON file: ${error}`);
                res.status(500).send('Error reading summary JSON file');
                return;
              }
              const summaryResults = JSON.parse(data);
              res.json({ searchResults, summaryResults });
            });
          } else {
            res.json({ searchResults, summaryResults: [] });
          }
        });
      });
    } else {
      res.status(404).send('No search results found');
    }
  });
});

function getLatestJsonFile(directory) {
  try {
    const files = fs.readdirSync(directory);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    if (jsonFiles.length === 0) {
      return null;
    }
    const latestFile = jsonFiles.reduce((prev, current) => {
      const prevPath = path.join(directory, prev);
      const currentPath = path.join(directory, current);
      return fs.statSync(prevPath).mtime > fs.statSync(currentPath).mtime ? prev : current;
    });
    return path.join(directory, latestFile);
  } catch (error) {
    console.error(`Failed to get the latest JSON file from directory '${directory}':`, error);
    return null;
  }
}

app.get('/search-archive', (req, res) => {
  console.log(`Reading search archive directory: ${searchArchiveDir}`);

  fs.readdir(searchArchiveDir, (error, files) => {
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
  const filePath = path.join(searchArchiveDir, file);
  console.log(`Reading JSON file: ${filePath}`);

  fs.readFile(filePath, 'utf8', (error, data) => {
    if (error) {
      console.error(`Error reading JSON file: ${error}`);
      res.status(500).send('Error reading JSON file');
      return;
    }
    console.log(`JSON file read successfully: ${filePath}`);
    const searchResults = JSON.parse(data);
    res.json(searchResults);
  });
});

app.get('/summary-archive', (req, res) => {
  fs.readdir(summaryArchiveDir, (error, files) => {
    if (error) {
      console.error(`Error reading summary archive directory: ${error}`);
      res.status(500).send('Error reading summary archive directory');
      return;
    }
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    console.log(`Found ${jsonFiles.length} JSON files in summary archive`);
    res.json(jsonFiles);
  });
});

app.get('/summary-archive/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(summaryArchiveDir, file);
  console.log(`Reading JSON file: ${filePath}`);

  fs.readFile(filePath, 'utf8', (error, data) => {
    if (error) {
      console.error(`Error reading JSON file: ${error}`);
      res.status(500).send('Error reading JSON file');
      return;
    }
    console.log(`JSON file read successfully: ${filePath}`);
    const summaryResults = JSON.parse(data);
    res.json(summaryResults);
  });
});

app.post('/download', (req, res) => {
  const ranks = req.body.ranks;
  console.log(`Received download request: ranks=${ranks}`);

  // Split the ranks into an array
  const rankList = ranks.split(',').map(rank => rank.trim());

  // Execute the save_full_text script with the provided rank list
  const saveFullTextScriptPath = path.join(baseDir, config.scriptsDir, 'save_full_text.py');
  const saveFullTextArgs = [saveFullTextScriptPath, ...rankList];

  execFile('/usr/bin/python3', saveFullTextArgs, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing save_full_text script: ${error}`);
      console.error(`Standard Error: ${stderr}`);
      res.status(500).send('Error executing save_full_text script');
      return;
    }

    console.log('Download script executed successfully');
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
