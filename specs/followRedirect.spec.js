const { parse: parseUrl } = require('url');
const https = require('https');
const followRedirect = require('../lib/followRedirect');

const method = 'GET';
const originalUrl = 'https://yandex.ru/';
const originalParsedUrl = Object.assign({}, parseUrl(originalUrl), { method });
const firstRedirectUrl = 'https://bing.com/';
const firstRedirectParsedUrl = Object.assign({}, parseUrl(firstRedirectUrl), {
  method
});
const secondRedirectUrl = 'https://google.com/';
const secondRedirectParsedUrl = Object.assign({}, parseUrl(secondRedirectUrl), {
  method
});

const redirectResponse = (url) => ({
  statusCode: 302,
  headers: {
    location: url
  }
});
const lastResponse = {
  statusCode: 200,
  data: "finally you've come"
};

jest.mock('https');

describe('basic functionality', () => {
  it('it should follow redirects', () => {
    const finalCallback = jest.fn();

    followRedirect(originalUrl, method, finalCallback);
    expect(https.request).toHaveBeenCalledWith(
      originalParsedUrl,
      expect.any(Function)
    );

    https.request._requestCallback(redirectResponse(firstRedirectUrl));

    expect(https.request).toHaveBeenCalledWith(
      firstRedirectParsedUrl,
      expect.any(Function)
    );

    https.request._requestCallback(redirectResponse(secondRedirectUrl));

    expect(https.request).toHaveBeenCalledWith(
      secondRedirectParsedUrl,
      expect.any(Function)
    );

    https.request._requestCallback(lastResponse);

    expect(finalCallback).toHaveBeenCalledWith(lastResponse);
  });
});
