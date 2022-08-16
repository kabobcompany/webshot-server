const puppeteer = require('puppeteer');

async function takeScreenshot (url, options) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  const resp = await page.goto(url, {"waitUntil" : "networkidle0"})
    .catch((error) => { return { error: error }; });

  if (resp.error) {
    return resp;
  }

  const data = await page.screenshot(options);

  await browser.close();
  return data;
}

var http = require('http');
var url = require('url');
var Jimp = require("jimp");
var ip   = '127.0.0.1', port = 2000;

function notFound(res, err) {
  if (err) {
    console.log(err);
  }
  res.writeHead(404);
  res.end();
}

http.createServer(function (req, res) {
  var q = url.parse(req.url, true).query;
  console.log('Request: ' + q.url);
  if (q.url) {
    var options = {
      type: 'png',
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    };

    (async ()=> {
      const data = await takeScreenshot(q.url, options);

      if (data.error) { return notFound(res, data.error); }

      res.writeHead(200, {'Content-Type': 'image/png' });
      Jimp.read(data, function (err, image) {
        if (err) {
          notFound(res, err);
          return;
        }
        image.resize(1280, 720)
          .quality(80)
          .getBuffer(Jimp.MIME_PNG, function (err, buffer) {
            if (err) {
              notFound(res, err);
              return;
            }
            res.write(buffer);
            res.end();
          });
      });
    })();

  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(port, ip);

console.log('Server listen on ' + ip + ':' + port);
