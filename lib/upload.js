import https from 'node:https';
import { upload as yaDiskUpload } from 'ya-disk';
import { parse as urlParse } from 'node:url';

/**
 * Creates writable stream for uploading file to Yandex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename on the storage
 * @param {boolean} [overwrite=true] Overwrite existing file
 * @returns {Promise<import('stream').Writable>}
 */
export async function upload(token, file, overwrite = true) {
  const { href, method } = await yaDiskUpload.link(token, file, overwrite);
  return https.request(Object.assign({}, urlParse(href), { method }));
}
