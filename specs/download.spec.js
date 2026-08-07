const fs = require('fs');
const path = require('path');
const https = require('https');
const { parse: urlParse } = require('url');
const assert = require('node:assert/strict');
const { afterEach, beforeEach, describe, mock, test } = require('node:test');

const yaDisk = require('ya-disk');
const download = require('../lib/download');

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const downloadLink = 'https://disk.yandex.ru/download';
const downloadMethod = 'GET';

const readableStream = fs.createReadStream(
  path.join(__dirname, '..', 'package.json')
);

describe('download', () => {
  let linkMock;
  let onReadyCallback;
  let onErrorCallback;

  beforeEach(() => {
    onReadyCallback = mock.fn();
    onErrorCallback = mock.fn();

    linkMock = mock.method(
      yaDisk.download,
      'link',
      (token, file, success, error) => {
        linkMock._onSuccessCallback = success;
        linkMock._onErrorCallback = error;
      }
    );
  });

  afterEach(() => mock.restoreAll());

  test('should call download.link with correct params and fire onReady callback in case of success', () => {
    download(token, file, onReadyCallback);

    assert.deepStrictEqual(linkMock.mock.calls[0].arguments.slice(0, 2), [
      token,
      file
    ]);
    assert.strictEqual(typeof linkMock.mock.calls[0].arguments[2], 'function');

    const httpsRequestMock = mock.method(
      https,
      'request',
      (options, callback) => {
        httpsRequestMock._callback = callback;
        return { end: () => {} };
      }
    );

    linkMock._onSuccessCallback({
      href: downloadLink,
      method: downloadMethod
    });

    assert.deepStrictEqual(
      httpsRequestMock.mock.calls[0].arguments[0],
      Object.assign({}, urlParse(downloadLink), { method: downloadMethod })
    );

    httpsRequestMock._callback({ statusCode: 200, ...readableStream });

    assert.strictEqual(
      onReadyCallback.mock.calls[0].arguments[0].statusCode,
      200
    );
  });

  test('should fire the onError callback in case of error', () => {
    const error = new Error('error message');

    download(token, file, onReadyCallback, onErrorCallback);

    linkMock._onErrorCallback(error);

    assert.deepStrictEqual(onErrorCallback.mock.calls[0].arguments[0], error);
  });
});
