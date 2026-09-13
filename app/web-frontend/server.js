const path = require('node:path');
const http = require('node:http');
const express = require('express');
const morgan = require('morgan');

const app = express();
const port = Number(process.env.PORT_WEB || 3000);
const publicDirectory = path.join(__dirname, 'public');

function proxyApiRequest(req, res, next) {
  if (!req.url.startsWith('/api/')) return next();
  const proxyRequest = http.request({
    hostname: '127.0.0.1',
    port: Number(process.env.PORT_API || 3001),
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${process.env.PORT_API || 3001}` }
  }, (proxyResponse) => {
    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(res);
  });
  proxyRequest.on('error', next);
  req.pipe(proxyRequest);
}

app.use(morgan('combined'));
app.use(proxyApiRequest);
app.use(express.static(publicDirectory));
app.get('*', (req, res) => res.sendFile(path.join(publicDirectory, 'index.html')));

if (require.main === module) {
  app.listen(port, () => console.log(`web-frontend listening on port ${port}`));
}

module.exports = app;
