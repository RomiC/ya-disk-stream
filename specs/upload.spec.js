import https from 'node:https';
import { parse as urlParse } from 'node:url';
import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';

import { upload } from '../lib/upload.js';

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const overwrite = false;

const uploadLinkResponse = {
  href: 'https://example.com/',
  method: 'PUT'
};
const httpsRequestParams = Object.assign(
  {},
  urlParse(uploadLinkResponse.href),
  { method: uploadLinkResponse.method }
);

describe('upload', () => {
  afterEach(() => mock.restoreAll());

  test('should get upload link and create writable stream', async () => {
    mock.method(globalThis, 'fetch', () =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(uploadLinkResponse))
      })
    );

    const httpsRequestMock = mock.method(https, 'request', () => ({
      end: () => {},
      on: () => {}
    }));

    await upload(token, file, overwrite);

    assert.deepStrictEqual(
      httpsRequestMock.mock.calls[0].arguments[0],
      httpsRequestParams
    );
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

    await assert.rejects(upload(token, file, overwrite), {
      name: 'UnauthorizedError',
      message: 'Not authorized'
    });
  });
});
