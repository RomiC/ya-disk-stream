import test from 'ava';
import https from 'https';
import { stub } from 'sinon';
import { Writable } from 'stream';
import { parse as urlParse } from 'url';

import { upload as yaUpload } from 'ya-disk';

import upload from '../lib/upload';

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const overwrite = false;
const nopeFn = () => {};

const uploadLinkResponseMock = {
  href: 'https://example.com/',
  method: 'PUT'
};
const httpsRequestParamsMock = Object.assign(urlParse(uploadLinkResponseMock.href), { method: uploadLinkResponseMock.method });
const httpsResponseMock = new Writable();

test.afterEach(() => {
  if (typeof yaUpload.link.restore === 'function') {
    yaUpload.link.restore();
  }
  if (typeof https.request.restore === 'function') {
    https.request.restore();
  }
});

test.serial.cb('it should call upload.link with correct params and fire onReady callback in case of success', (t) => {
  const yaUploadLinkStub = stub(yaUpload, 'link').callsArgWithAsync(3, uploadLinkResponseMock);
  const httpsRequestStub = stub(https, 'request').returns(httpsResponseMock);

  const onReadyStub = stub().callsFake(() => {
    t.true(yaUploadLinkStub.calledWith(token, file, overwrite), 'should call call download.link with correct params');
    t.true(httpsRequestStub.calledWithMatch(httpsRequestParamsMock), 'should fire https.request with correct params');
    t.true(onReadyStub.calledWith(httpsResponseMock), 'should fire onReady callback with correct param');
    t.end();
  });

  upload(token, file, overwrite, onReadyStub, nopeFn);
});

test.serial.cb('it should fire the onError callback in case of error', (t) => {
  const err = new Error('error message');
  stub(yaUpload, 'link').callsArgWithAsync(4, err);

  const onErrorStub = stub().callsFake(() => {
    t.true(onErrorStub.calledWithExactly(err), 'should fire onError callback with error object');
    t.end();
  });

  upload(token, file, overwrite, nopeFn, onErrorStub);
});