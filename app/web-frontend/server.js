const path = require('node:path');
const express = require('express');
const morgan = require('morgan');

const app = express();
const port = Number(process.env.PORT_WEB || 3000);
const publicDirectory = path.join(__dirname, 'public');

app.use(morgan('combined'));
app.use(express.static(publicDirectory));
app.get('*', (req, res) => res.sendFile(path.join(publicDirectory, 'index.html')));

if (require.main === module) {
  app.listen(port, () => console.log(`web-frontend listening on port ${port}`));
}

module.exports = app;
