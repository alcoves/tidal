const path = require('path');
const fs = require('fs-extra');
const shortid = require('shortid');

module.exports = () => {
  fs.mkdirpSync('./tmp');
  return fs.mkdirpSync(path.resolve(`./tmp/${shortid()}`));
};
