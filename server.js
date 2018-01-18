/**
***  RESOURCES:
***    Set file size limit ---> https://stackoverflow.com/a/4310087/7641789
***    Remove file after getting file size ---> https://stackoverflow.com/a/5315175/7641789
***    Handle file upload and creation ---> http://shiya.io/simple-file-upload-with-express-js-and-formidable-in-node-js/
**/

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');

let index = null;
let upload = null;
let css = null;

fs.readFile('./www/index.html', (err, data) => {
  if(err) { console.log(err); throw err; }
  else {
    index = data;
  }
});

fs.readFile('./www/upload.html', (err, data) => {
  if(err) { console.log(err); throw err; }
  else {
    upload = data;
  }
});

fs.readFile('./www/style.css', (err, data) => {
  if(err) { console.log(err); throw err; }
  else {
    css = data;
  }
});

let server = http.createServer((req, res) => {
  req.url = req.url.slice(1);
  if(req.url === '') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
  }
  else if(req.url.includes('style.css')) {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(css);
  }
  else if(req.url.includes('favicon.ico')) {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
    res.end('https://cdn.glitch.com/fe975ea0-692f-4cc9-a81e-6f749061be29%2Fblog_logo.ico?1515448766888');
  }
  else if(req.url.includes('upload')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(upload);
  }
  else {
    // if upload exceed 1MB (1e6 === 1 * Math.pow(10, 6))
    if(req.headers['content-length'] > 1e6) {
      req.connection.destroy();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('File upload exceeds 1MB');
    }
    else {
      let result = null;
      let path = null;
      let form = new formidable.IncomingForm();
      form.keepExtensions = true;
      form.parse(req);
      form.on('fileBegin', (name, file) => {
        file.path = __dirname + '/upload/' + file.name;
        path = file.path;
      });
      form.on('file', (name, file) => {
        result = file.size;
      });
      form.on('end', () => {
        fs.unlink(path);

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify({ size: result }));
      });
    }
  }
}).on('error', (err) => { console.log(err); throw err; });

let listener = server.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});



/**
*** Manually writing file not working - wrong file size
***

let body = '';
let fileName = null;

req.on('data', data => {
  body += data;
});

req.on('end', () => {
  fileName = /;\sfilename=".*"/.exec(body);
  fileName = fileName[0].slice(12, (fileName[0].length - 1));
  fs.writeFile(`./upload/${fileName}`, body, 'binary', err => {
    if(err) { console.log(err); throw err; }
    else {
       fs.stat(`./upload/${fileName}`, (err, stats) => {
         if(err) { console.log(err); throw err; }
         else {
           console.log(stats);
           fs.unlink(`./upload/${fileName}`);
         }
       });
    }
  });

  res.end();
});

***
**/