# Bridge.js

Bridge.js is a browser compatibility application allowing developers to keep up with the latest JavaScript syntax features based on the latest ECMAScript standard. Simply type in a JavaScript keyword and the browser compatibility rules for that keyword is returned to the user. The browser compatibility data comes with the application out of the box and can be found in the ‘browser.json’ file in the project’s root directory but can be regenerated with a request to the ‘/db’ route which initiates the web crawler that scrapes the latest browser compatibility rules from MDN. This step is only necessary if the user decides to remove the ‘browser.json’ file. Otherwise, upon running the application, the client-side search functionality is ready for use.

 Please check out or download the latest stable tag before using in production. Bug reports and pull requests are welcome.

 Maintained by @ac3639 and other contributors.
 
