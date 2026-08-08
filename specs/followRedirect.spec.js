import https from 'node:https';
import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';

import { followRedirect } from '../lib/followRedirect.js';

const method = 'GET';
const originalUrl = 'https://yandex.ru/';
const firstRedirectUrl = 'https://bing.com/';
const secondRedirectUrl = 'https://google.com/';

const redirectResponse = (url) => ({
  statusCode: 302,
  headers: {
    location: url
  },
  destroy: () => {}
});
const lastResponse = {
  statusCode: 200
};

describe('followRedirect', () => {
  let httpsRequestMock;

  afterEach(() => mock.restoreAll());

  test('should follow redirects', async () => {
    httpsRequestMock = mock.method(
      https,
      'request',
      (url, options, callback) => {
        httpsRequestMock._callback = callback;
        return { end: () => {}, on: () => {} };
      }
    );

    const promise = followRedirect(originalUrl, method);

    assert.strictEqual(
      httpsRequestMock.mock.calls[0].arguments[0],
      originalUrl
    );
    assert.deepStrictEqual(httpsRequestMock.mock.calls[0].arguments[1], {
      method
    });

    httpsRequestMock._callback(redirectResponse(firstRedirectUrl));

    assert.strictEqual(
      httpsRequestMock.mock.calls[1].arguments[0],
      firstRedirectUrl
    );
    assert.deepStrictEqual(httpsRequestMock.mock.calls[1].arguments[1], {
      method
    });

    httpsRequestMock._callback(redirectResponse(secondRedirectUrl));

    assert.strictEqual(
      httpsRequestMock.mock.calls[2].arguments[0],
      secondRedirectUrl
    );
    assert.deepStrictEqual(httpsRequestMock.mock.calls[2].arguments[1], {
      method
    });

    httpsRequestMock._callback(lastResponse);

    const result = await promise;

    assert.deepStrictEqual(result, lastResponse);
  });

  test('should reject on unexpected status code', async () => {
    httpsRequestMock = mock.method(
      https,
      'request',
      (url, options, callback) => {
        httpsRequestMock._callback = callback;
        return { end: () => {}, on: () => {} };
      }
    );

    const promise = followRedirect(originalUrl, method);

    httpsRequestMock._callback({ statusCode: 500 });

    await assert.rejects(promise, {
      message: 'Unexpected status code: 500'
    });
  });
});
