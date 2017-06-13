var webshot = require('webshot');
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
      defaultWhiteBackground: true,
      screenSize: {
        width: 1280,
        height: 720
      }
    };

    var headSent = false;
    var renderStream = webshot(q.url, options);
    var bytes = [];
    renderStream.on('data', function(data) {
      if (!headSent) {
        res.writeHead(200, {'Content-Type': 'image/png' });
        headSent = true;
        console.log('Screenshot...');
      }
      bytes.push(data);
    });

    renderStream.on('end', function () {
      if (!headSent) {
        notFound(res);
        return;
      }
      Jimp.read(Buffer.concat(bytes), function (err, image) {
        if (err) {
          notFound(res, err);
          return;
        }
        image.resize(640, 360)
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
    });

    renderStream.on('error', function (err) {
      console.log(err);
      res.writeHead(404);
      res.end();
    });
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(port, ip);

console.log('Server listen on ' + ip + ':' + port);
