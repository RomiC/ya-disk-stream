import test from 'ava';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { stub } from 'sinon';

import { upload as yaUpload } from 'ya-disk';

import upload from '../lib/upload';

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const overwrite = false;
const nopeFn = () => {};

const writableStream = fs.createWriteStream(path.join(__dirname, '..', 'test.txt'));

test.afterEach(() => {
  if (typeof yaUpload.link.restore === 'function') {
    yaUpload.link.restore();
  }
  if (typeof https.request.restore === 'function') {
    https.request.restore();
  }
});

test.serial.cb('it should call upload.link with correct params and fire onReady callback in case of success', (t) => {
  const yaUploadLinkStub = stub(yaUpload, 'link').callsArgWithAsync(2, writableStream);

  const onReadyStub = stub().callsFake((arg) => {
    t.true(yaUploadLinkStub.calledWith(token, file), 'should call call download.link with correct params');
    t.true(onReadyStub.calledWith(writableStream), 'should fire onReady callback with correct param');
    t.end();
  });

  upload(token, file, overwrite, onReadyStub, nopeFn);
});

test.serial.cb('it should fire the onError callback in case of error', (t) => {
  const err = new Error('error message');
  const yaUploadLinkStub = stub(yaUpload, 'link').callsArgWithAsync(3, err);

  const onErrorStub = stub().callsFake(() => {
    t.true(onErrorStub.calledWithExactly(err), 'should fire onError callback with error object');
    t.end();
  });

  upload(token, file, overwrite, nopeFn, onErrorStub);
});