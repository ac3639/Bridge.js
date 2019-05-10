const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');


module.exports = {
  checkFiles: (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    const exists = fs.existsSync('browser.json');
    if(!exists){
      return next();
    }

    fs.readFile('browser.json', 'utf-8', (err, data) => {
      if(err) console.log(err);
      res.locals.cache = JSON.parse(data);
      next();
    })
  },

  // gets links for recent javascript version
  initialScrape: (req, res, next) => {
    // grab links to javascript releases
    if (res.locals.cache) {
        return next();
    }

    https.get('https://developer.mozilla.org/en-US/docs/Web/JavaScript', (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      })
      response.on('end', () => {
        // cheerio.load parses html string and provides methods to retrieve and
        // manipulate parts of html string
        const $ = cheerio.load(body);
        const links = $('#quick-links').find('ol li ol li a');

        let result = [];
        links.each(function(index){
          const href = $(this).attr('href');
          if (href.includes("New_in_JavaScript")) {
            result.push("https://developer.mozilla.org" + href);
          }
        })

        res.locals.versions = result;
        next();
      });
    })
    .on('error', (e) => {
      console.log(e)
    })
  },

  // for each version retreives links to all of the key words
  getVersions: (req, res, next) => {
    if (res.locals.cache) {
        return next();
    }

    const promises = res.locals.versions.map((version) => {
      return new Promise((resolve, reject) => {
        https.get(version, (response) => {
          let body = '';
          response.on('data', (d) => {
            body += d;
          })
          response.on('end', () => {
            const $ = cheerio.load(body);
            const links = $('ul li a[href*="/en-US/docs/Web/JavaScript/Reference/"]');
            let result = [];

            links.each(function(index){
              const href = $(this).attr('href');
              result.push("https://developer.mozilla.org" + href.replace(/__/g, '').trim());
            })
            resolve(result);
          })
        })
      })
    });

    // flattens array of arrays of urls [[somurl/let, someurl/const], [someurl/Array]] ->
    // { let: someurl/let, const: someurl/const, Array: someurl/Array }
    Promise.all(promises).then((v) => {
      const final = v.reduce((obj, subArray) => {
        return subArray.reduce((newObj, link) => {
          const key = link.slice(link.lastIndexOf('/') + 1);
          if(!key.includes("#") && !key.includes("_") && !link.includes('developer.mozilla.orghttps')){
            newObj[key] = link;
          }
          if(key.includes('Arrow_functions')){
            newObj['=>'] = link;
          }
          return newObj;
        }, obj)
      }, {});

      res.locals.keyWords = final;
      next();
    })
  },

  // from key word links, retrieves info about browser compatibility
  getCompatibility: (req, res, next) => {
    if (res.locals.cache) {
        return next();
    }
    const promises = Object.keys(res.locals.keyWords).map((word) => {
      return new Promise((resolve, reject) => {
        https.get(res.locals.keyWords[word], (response) => {
          let body = '';
          response.on('data', (d) => {
            body += d;
          })

          response.on('end', () => {
            const $ = cheerio.load(body);

            const result = {
              word: word,
              link: res.locals.keyWords[word]
            };

            const tBody = $('body').find('.bc-table-js tbody tr').first();
            const columns = tBody.find('td');

            columns.each(function(index){
              const className = $(this).attr('class');
              const text = $(this).text().trim();
              result[className.slice(className.lastIndexOf(' ') + 1).replace('bc-browser-', '')] = text.slice(text.lastIndexOf(' ') + 1);
            });

            resolve(result);
          });
        }).on('error', (e) => {
          console.log(e);
          reject(e);
        })
      });
    });

    Promise.all(promises).then((v) => {
      res.locals.cache = v;
      fs.writeFile('browser.json', JSON.stringify(res.locals.cache, null, 4), (err) => {
        res.json(res.locals.cache);
      });
    })
  },
}
