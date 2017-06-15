const https = require('https');
const { upload } = require('ya-disk');
const { parse: urlParse } = require('url');

/**
 * Create writable stream for uploading file to Yandex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename in the storage
 * @param {boolean} [overwrite=true] Overwrite existing file
 * @param {function} onReady Callback-function to be called after stream being ready
 * @param {function} onError Callback-function to be called in case of any error
 * @return {http.ClientRequest} Writable stream for uploading file
 */
const uploadStream = (token, file, overwrite = true, onReady, onError) => {
  upload.link(
    token,
    file,
    overwrite,
    ({ href, method }) => onReady(https.request(Object.assign({}, urlParse(href), { method }))),
    onError
  );
};

module.exports = uploadStream;