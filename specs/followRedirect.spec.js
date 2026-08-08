import { parse as urlParse } from 'node:url';
import https from 'node:https';
import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';

import { followRedirect } from '../lib/followRedirect.js';

const method = 'GET';
const originalUrl = 'https://yandex.ru/';
const originalParsedUrl = Object.assign({}, urlParse(originalUrl), { method });
const firstRedirectUrl = 'https://bing.com/';
const firstRedirectParsedUrl = Object.assign({}, urlParse(firstRedirectUrl), {
  method
});
const secondRedirectUrl = 'https://google.com/';
const secondRedirectParsedUrl = Object.assign({}, urlParse(secondRedirectUrl), {
  method
});

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
    httpsRequestMock = mock.method(https, 'request', (options, callback) => {
      httpsRequestMock._callback = callback;
      return { end: () => {}, on: () => {} };
    });

    const promise = followRedirect(originalUrl, method);

    assert.deepStrictEqual(
      httpsRequestMock.mock.calls[0].arguments[0],
      originalParsedUrl
    );

    httpsRequestMock._callback(redirectResponse(firstRedirectUrl));

    assert.deepStrictEqual(
      httpsRequestMock.mock.calls[1].arguments[0],
      firstRedirectParsedUrl
    );

    httpsRequestMock._callback(redirectResponse(secondRedirectUrl));

    assert.deepStrictEqual(
      httpsRequestMock.mock.calls[2].arguments[0],
      secondRedirectParsedUrl
    );

    httpsRequestMock._callback(lastResponse);

    const result = await promise;

    assert.deepStrictEqual(result, lastResponse);
  });

  test('should reject on unexpected status code', async () => {
    httpsRequestMock = mock.method(https, 'request', (options, callback) => {
      httpsRequestMock._callback = callback;
      return { end: () => {}, on: () => {} };
    });

    const promise = followRedirect(originalUrl, method);

    httpsRequestMock._callback({ statusCode: 500 });

    await assert.rejects(promise, {
      message: 'Unexpected status code: 500'
    });
  });
});
