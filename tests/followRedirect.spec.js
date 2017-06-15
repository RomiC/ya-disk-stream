import test from 'ava';
import https from 'https';
import { stub, spy } from 'sinon';

import followRedirect from '../lib/followRedirect';

const originalUrl = 'https://yandex.ru/';
const firstRedirectUrl = 'https://bing.com/';
const secondRedirectUrl = 'https://google.com/';

const httpClientMock = { end: () => {} };
const redirectResponse = (url) => ({
  statusCode: 302,
  headers: {
    location: url
  }
});
const lastResponse = {
  statusCode: 200,
  data: 'finally you\'ve come'
};

test.cb('it should follow redirects', (t) => {
  const httpsRequest = stub(https, 'request').callsFake(({ href }, cb) => {
    let redirectUrl = null;

    switch (href) {
      case originalUrl:
        redirectUrl = firstRedirectUrl;
        break;

      case firstRedirectUrl:
        redirectUrl = secondRedirectUrl;
        break;
    }

    setTimeout(() => cb(redirectUrl === null ? lastResponse : redirectResponse(redirectUrl)), 0);

    return { end: () => {} };
  });

  const finalCallback = stub().callsFake((args) => {
    t.true(httpsRequest.calledThrice, 'https.request should called exact 3 times');
    t.is(httpsRequest.firstCall.args[0].href, originalUrl, `should call https.request with \'${originalUrl}\' first time`);
    t.is(httpsRequest.secondCall.args[0].href, firstRedirectUrl, `should call https.request with \'${firstRedirectUrl}\' second time`);
    t.is(httpsRequest.thirdCall.args[0].href, secondRedirectUrl, `should call https.request with \'${secondRedirectUrl}\' third time`);
    t.is(args, lastResponse, 'callback should be fired with correct params');
    t.end();
  });

  followRedirect(originalUrl, 'GET', finalCallback);
});