const { parse: urlParse } = require('url');
const https = require('https');
const assert = require('node:assert/strict');
const { afterEach, describe, mock, test } = require('node:test');

const followRedirect = require('../lib/followRedirect');

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

  test('should follow redirects', () => {
    const finalCallback = mock.fn();

    httpsRequestMock = mock.method(https, 'request', (options, callback) => {
      httpsRequestMock._callback = callback;
      return { end: () => {} };
    });

    followRedirect(originalUrl, method, finalCallback);

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

    assert.deepStrictEqual(
      finalCallback.mock.calls[0].arguments[0],
      lastResponse
    );
  });
});
