const https = require('https');
const { parse: urlParse } = require('url');
const assert = require('node:assert/strict');
const { afterEach, beforeEach, describe, mock, test } = require('node:test');

const yaDisk = require('ya-disk');
const upload = require('../lib/upload');

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const overwrite = false;

const uploadLinkResponseMock = {
  href: 'https://example.com/',
  method: 'PUT'
};
const httpsRequestParamsMock = Object.assign(
  {},
  urlParse(uploadLinkResponseMock.href),
  { method: uploadLinkResponseMock.method }
);

describe('upload', () => {
  let linkMock;

  beforeEach(() => {
    linkMock = mock.method(
      yaDisk.upload,
      'link',
      (token, file, overwrite, success, error) => {
        linkMock._onSuccessCallback = success;
        linkMock._onErrorCallback = error;
      }
    );
  });

  afterEach(() => mock.restoreAll());

  test('should call upload.link with correct params and fire onReady callback in case of success', () => {
    const onReadyMock = mock.fn();

    upload(token, file, overwrite, onReadyMock);

    assert.deepStrictEqual(linkMock.mock.calls[0].arguments.slice(0, 3), [
      token,
      file,
      overwrite
    ]);
    assert.strictEqual(typeof linkMock.mock.calls[0].arguments[3], 'function');

    const httpsRequestMock = mock.method(https, 'request', () => {
      return { end: () => {} };
    });

    linkMock._onSuccessCallback(uploadLinkResponseMock);

    assert.deepStrictEqual(
      httpsRequestMock.mock.calls[0].arguments[0],
      httpsRequestParamsMock
    );
    assert.strictEqual(onReadyMock.mock.callCount(), 1);
  });

  test('should fire the onError callback in case of error', () => {
    const error = new Error('error message');
    const onErrorMock = mock.fn();

    upload(token, file, overwrite, undefined, onErrorMock);

    linkMock._onErrorCallback(error);

    assert.deepStrictEqual(onErrorMock.mock.calls[0].arguments[0], error);
  });
});
