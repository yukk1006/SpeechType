const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'finance-web');
const dest = __dirname;
fs.readdirSync(src).forEach(file => {
  fs.renameSync(path.join(src, file), path.join(dest, file));
});
fs.rmdirSync(src);
