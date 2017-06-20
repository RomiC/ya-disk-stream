const { download } = require('ya-disk');

const followRedirect = require('./followRedirect');

/**
 * Creates readable stream to download file from the Yadex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename on the storage
 * @param {function} [onReady] Callback to be called after stream being ready
 * @param {function} [onError] Callback to be called in case of any error
 */
module.exports = (token, file, onReady, onError) =>
  download.link(
    token,
    file,
    ({ href, method }) => followRedirect(href, method, (req) => onReady(req)),
    onError
  );