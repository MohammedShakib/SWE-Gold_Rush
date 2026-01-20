const path = require('path');

process.chdir(path.join(__dirname, 'server'));
require(path.join(__dirname, 'server', 'index.js'));
