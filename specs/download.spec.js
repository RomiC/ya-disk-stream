import https from 'node:https';
import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';

import { download } from '../lib/download.js';

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const downloadLink = 'https://disk.yandex.ru/download';
const downloadMethod = 'GET';

describe('download', () => {
  afterEach(() => mock.restoreAll());

  test('should get download link and follow redirect', async () => {
    mock.method(globalThis, 'fetch', () =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({ href: downloadLink, method: downloadMethod })
          )
      })
    );

    const httpsRequestMock = mock.method(
      https,
      'request',
      (url, options, callback) => {
        httpsRequestMock._callback = callback;
        return { end: () => {}, on: () => {} };
      }
    );

    const promise = download(token, file);

    // Wait for the async chain to settle
    await new Promise((r) => setTimeout(r, 0));

    assert.strictEqual(
      httpsRequestMock.mock.calls[0].arguments[0],
      downloadLink
    );
    assert.deepStrictEqual(httpsRequestMock.mock.calls[0].arguments[1], {
      method: downloadMethod
    });

    httpsRequestMock._callback({ statusCode: 200 });

    const stream = await promise;
    assert.strictEqual(stream.statusCode, 200);
  });

  test('should reject when ya-disk API call fails', async () => {
    mock.method(globalThis, 'fetch', () =>
      Promise.resolve({
        ok: false,
        status: 401,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              error: 'UnauthorizedError',
              description: 'Not authorized'
            })
          )
      })
    );

    await assert.rejects(download(token, file), {
      name: 'UnauthorizedError',
      message: 'Not authorized'
    });
  });
});
