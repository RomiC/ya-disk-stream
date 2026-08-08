const https = require('https');
const { upload } = require('ya-disk');
const { parse: urlParse } = require('url');

/**
 * Creates writable stream for uploading file to Yandex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename on the storage
 * @param {boolean} [overwrite=true] Overwrite existing file
 * @returns {Promise<import('stream').Writable>}
 */
module.exports = async (token, file, overwrite = true) => {
  const { href, method } = await upload.link(token, file, overwrite);
  return https.request(Object.assign({}, urlParse(href), { method }));
};
