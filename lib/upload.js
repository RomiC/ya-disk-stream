const https = require('https');
const { upload } = require('ya-disk');
const { parse: urlParse } = require('url');

/**
 * Create writable stream for uploading file to Yandex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename on the storage
 * @param {boolean} [overwrite=true] Overwrite existing file
 * @param {function} onReady Callback to be called after stream being ready
 * @param {function} onError Callback to be called in case of any error
 */
module.exports = (token, file, overwrite = true, onReady, onError) =>
  upload.link(
    token,
    file,
    overwrite,
    ({ href, method }) => onReady(https.request(Object.assign({}, urlParse(href), { method }))),
    onError
  );