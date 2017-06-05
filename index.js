var webshot = require('webshot');
var http = require('http');
var url = require('url');
var sharp = require('sharp');
var ip   = '127.0.0.1', port = 2000;

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
    var roundedCornerResizer = sharp().resize(640, 360).png();
    renderStream.pipe(roundedCornerResizer);
    
    roundedCornerResizer.on('data', function(data) {
      if (!headSent) {
        res.writeHead(200, {'Content-Type': 'image/png' });
        headSent = true;
        console.log('Screenshot...');
      }
      res.write(data.toString('binary'), 'binary');
    });

    roundedCornerResizer.on('end', function () {
      if (!headSent) {
        res.writeHead(404);
      }
      res.end();
    });

    roundedCornerResizer.on('error', function (err) {
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
