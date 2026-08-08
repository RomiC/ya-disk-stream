import { download as yaDiskDownload } from 'ya-disk';

import { followRedirect } from './followRedirect.js';

/**
 * Creates readable stream to download file from Yandex.Disk
 * @param {string} token OAuth-token
 * @param {string} file Path+filename on the storage
 * @returns {Promise<import('stream').Readable>}
 */
export async function download(token, file) {
  const { href, method } = await yaDiskDownload.link(token, file);
  return followRedirect(href, method);
}
