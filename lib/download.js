const { download } = require('ya-disk');

const followRedirect = require('./followRedirect');

/**
 * Creates readable stream to download file from Yandex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename on the storage
 * @returns {Promise<import('stream').Readable>}
 */
module.exports = async (token, file) => {
  const { href, method } = await download.link(token, file);
  return followRedirect(href, method);
};
