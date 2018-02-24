const express = require("express");
const path = require("path");
// this is our production server for servimg index.html and bundle
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser')
const getKeyWords = require('./controller/getKeywords.js')
const wordController = require('./controller/WordController');

const PORT = 3000;


// parse application/json
// making req.body available as json when the request's content-type header === 'application/json'
// same-ish as....
// app.use((req, res, next) => {
//   if(res.header["Content-Type"] === "application/json"){
//     req.body = (body parsed into a json)
//   }
// })
app.use(bodyParser.json())

app.use((req, res, next) => {
  // allows other origins to requst your api
  // since we our running our dev environment from localhost:5000 we need to give it access
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
  // allows these request headers
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
//=================TEMPORARY ROUTE UNTIL DB IS UP=========================================================
// This was used to scrape mdn...
// It was super slow despite our best efforts so we saved the scrape to browser.json
app.get('/db', getKeyWords.checkFiles, getKeyWords.initialScrape, getKeyWords.getVersions, getKeyWords.getCompatibility, getKeyWords.parseCode);

// SHOULD BE REPLACED WITH DB REQUEST FIRST
app.get('/db/:banana', (req, res, next) => {
  // with req.params.word search the database for compatibility of that word
  // this request is made by the client everytime they type into textbox
  // if an object is not found, then an empty string is sent back to the client
  res.setHeader('Content-Type', 'application/json');
  fs.readFile('browser.json', 'utf-8', (err, data) => {
    const result = JSON.parse(data).find((obj) => {
      return obj.word === req.params.banana;
    });
    res.json(result);
  })
})

//=========================================================================================================


// any pathnames that do not match the pathnames above, send our static html file
app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname, "../build/index.html"))
})


app.listen(PORT, (err)=>{
  if (err) console.log('error')
  else console.log('server started on ', PORT)
})
