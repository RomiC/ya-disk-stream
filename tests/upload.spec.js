const https = require('https');
const { parse: urlParse } = require('url');
const yaDisk = require('ya-disk');
const upload = require('../lib/upload');

jest.mock('https');
jest.mock('ya-disk');

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const overwrite = false;

const uploadLinkResponseMock = {
  href: 'https://example.com/',
  method: 'PUT'
};
const httpsRequestParamsMock = Object.assign(
  urlParse(uploadLinkResponseMock.href),
  { method: uploadLinkResponseMock.method }
);

test('it should call upload.link with correct params and fire onReady callback in case of success', () => {
  const onReadyMock = jest.fn();

  upload(token, file, overwrite, onReadyMock);

  expect(yaDisk.upload.link).toHaveBeenLastCalledWith(
    token,
    file,
    overwrite,
    expect.any(Function),
    undefined
  );

  yaDisk.upload.link._onSuccessCallback(uploadLinkResponseMock);

  expect(https.request).toHaveBeenCalledWith(httpsRequestParamsMock);
  expect(onReadyMock).toHaveBeenCalledWith(expect.any(Object));
});

test('it should fire the onError callback in case of error', () => {
  const error = new Error('error message');
  const onErrorMock = jest.fn();

  upload(token, file, overwrite, undefined, onErrorMock);

  yaDisk.upload.link._onErrorCallback(error);

  expect(onErrorMock).toHaveBeenCalledWith(error);
});
