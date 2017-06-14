const { request } = require('https');
const { url: urlParse } = require('url');

const { download } = require('ya-disk');

const followRedirect = require('./followRedirect');

module.exports = (token, file, onReady, onError) =>
  download.link(
    token, 
    file,
    ({ href, method }) => followRedirect(href, method, (req) => onReady(req)),
    onError
  );