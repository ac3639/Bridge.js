const express = require("express");
const app = express();
const fs = require('fs');
const path = require('path');

const getKeyWords = require('./controller/getKeywords.js')

const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  next();
})

//==========================SENDING STATIC FILES FROM BUILD==============================================
// sends already transpiled and bundled files sent to build folder
app.get('/bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, "../build/bundle.js"))
})

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, "../build/styles.css"))
})

//========================================================================================================
//===============================DB RETRIEVAL=============================================================
app.get(
  '/db',
  getKeyWords.checkFiles,
  getKeyWords.initialScrape,
  getKeyWords.getVersions,
  getKeyWords.getCompatibility,
  (req, res, next) => {
      res.send(res.locals.cache);
  }
);

app.get(
  '/db/:requestedWord',
  getKeyWords.checkFiles,
  getKeyWords.initialScrape,
  getKeyWords.getVersions,
  getKeyWords.getCompatibility,
  (req, res, next) => {
    // with req.params.word search the database for compatibility of that word
    // this request is made by the client everytime they type into textbox
    // if an object is not found, then an empty string is sent back to the client
    const result = res.locals.cache.find((obj) => {
      return obj.word === req.params.requestedWord;
    });
    res.json(result);
  }
)

//=========================================================================================================
// any pathnames that do not match the pathnames above, send our static html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"))
})


app.listen(PORT, (err) => {
  if (err) console.log('error')
  else console.log('server started on ', PORT)
})
