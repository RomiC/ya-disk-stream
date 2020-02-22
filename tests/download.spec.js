const fs = require('fs');
const path = require('path');
const yaDisk = require('ya-disk');

const download = require('../lib/download');
const followRedirect = require('../lib/followRedirect');

jest.mock('ya-disk');
jest.mock('../lib/followRedirect');

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const downloadLink = 'https://disk.yandex.ru/download';
const downloadMethod = 'GET';
const onReadyCallback = jest.fn();
const onErrorCallback = jest.fn();

const readableStream = fs.createReadStream(
  path.join(__dirname, '..', 'package.json')
);

test('it should call download.link with correct params and fire onReady callback in case of success', () => {
  download(token, file, onReadyCallback);

  expect(yaDisk.download.link).toHaveBeenCalledWith(
    token,
    file,
    expect.any(Function),
    undefined
  );

  yaDisk.download.link._onSuccessCallback({
    href: downloadLink,
    method: downloadMethod
  });

  expect(followRedirect).toHaveBeenCalledWith(
    downloadLink,
    downloadMethod,
    expect.any(Function)
  );

  followRedirect._onReady(readableStream);

  expect(onReadyCallback).toHaveBeenCalledWith(readableStream);
});

test('it should fire the onError callback in case of error', () => {
  const error = new Error('error message');

  download(token, file, onReadyCallback, onErrorCallback);

  yaDisk.download.link._onErrorCallback(error);

  expect(onErrorCallback).toHaveBeenCalledWith(error);
});
