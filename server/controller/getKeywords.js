const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');


const formatOutput = (body, cache) => {
  return body.snippet.split(' ').reduce((obj, word) => {
    if(cache[word]){
      Object.keys(cache[word]).forEach((browser) => {
        if(!obj[browser] || (cache[word][browser] !== "Yes" && isNaN(cache[word][browser]))) {
          obj[browser] = cache[word][browser];
        }
        else if(obj[browser] !== "Yes" && isNaN(obj[browser])){
          // obj[browser] = obj[browser]
        }
        else if(obj[browser] && obj[browser] && obj[browser] !== cache[word][browser]){
          const prior = parseInt(obj[browser], 10);
          const now = parseInt(cache[word][browser], 10);
          if(obj[browser] === "Yes") obj[browser] = cache[word][browser];
          else if(cache[word][browser] !== "Yes") obj[browser] = Math.max(prior, now).toString();
        }
      })
    }
    return obj;
  }, {});
}

module.exports = {
  checkFiles: (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    const exists = fs.existsSync('browser.json');
    if(!exists){
      return next();
    }
    fs.readFile('browser.json', 'utf-8', (err, data) => {
      if(err) console.log(err);
      return res.json(formatOutput(req.body, JSON.parse(data)));
    })
  },

  initialScrape: (req, res, next) => {
    // grab links to javascript releases

    https.get('https://developer.mozilla.org/en-US/docs/Web/JavaScript', (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      })
      response.on('end', () => {
        const $ = cheerio.load(body);
        const links = $('#quick-links').find('a[href="/en-US/docs/Web/JavaScript/New_in_JavaScript"]').first().parent().find('ol li a');

        let result = [];
        links.each(function(index){
          const href = $(this).attr('href');
          result.push("https://developer.mozilla.org" + href);
        })

        res.locals.versions = result;
        next();
      })
    })
    .on('error', (e) => {
      console.log(e)
    })
  },

  getVersions: (req, res, next) => {
    // if(cache){
    //   return next();
    // }

    let promises = res.locals.versions.map((version) => {
      return new Promise((resolve, reject) => {
        https.get(version, (response) => {
          let body = '';
          response.on('data', (d) => {
            body += d;
          })
          response.on('end', () => {
            const $ = cheerio.load(body);
            //en-US/docs/Web/JavaScript/Reference/Statements/const
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

      // res.send(final);
      res.locals.keyWords = final;
      next();
    })
  },

  getCompatibility: (req, res, next) => {
    // if(cache){
    //   return next();
    // }

    let promises = Object.keys(res.locals.keyWords).map((word) => {
      return new Promise((resolve, reject) => {
        https.get(res.locals.keyWords[word], (response) => {
          let body = '';
          response.on('data', (d) => {
            body += d;
          })

          response.on('end', () => {
            const $ = cheerio.load(body);

            let result = {
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
      // const overall = v.reduce((obj, phrase) => {
      //   if(Object.keys(phrase).length > 1){
      //     obj[phrase.word] = phrase;
      //     delete obj[phrase.word].word;
      //     // delete obj[phrase.word].link;
      //   }
      //   return obj;
      // }, {})
      res.locals.cache = v;
      next();
      // res.send(overall);
    })
  },

  parseCode: (req, res, next) => {
    fs.writeFile('browser.json', JSON.stringify(res.locals.cache, null, 4), (err) => {
      res.json(res.locals.cache);
      // return res.json(formatOutput(req.body, res.locals.cache));
    })
  }
}
