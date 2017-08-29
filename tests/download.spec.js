import test from 'ava';
import fs from 'fs';
import path from 'path';
import proxyquire from 'proxyquire';
import { stub } from 'sinon';
import { download as yaDownload } from 'ya-disk';

const token = 'it-is-just-a-token-sample';
const file = 'disk:/file.txt';
const nopeFn = () => {};

const readableStream = fs.createReadStream(path.join(__dirname, '..', 'package.json'));

const followRedirectStub = stub().callsArgWithAsync(2, readableStream);
const download = proxyquire('../lib/download', {
  './followRedirect': followRedirectStub
});

test.afterEach(() => {
  if (typeof yaDownload.link.restore === 'function') {
    yaDownload.link.restore();
  }
});

test.serial.cb('it should call download.link with correct params and fire onReady callback in case of success', (t) => {
  const yaDownloadLinkStub = stub(yaDownload, 'link').callsArgWithAsync(2, readableStream);

  const onReadyStub = stub().callsFake(() => {
    t.true(yaDownloadLinkStub.calledWith(token, file), 'should call call download.link with correct params');
    t.true(onReadyStub.calledWith(readableStream), 'should fire onReady callback with correct param');
    t.end();
  });

  download(token, file, onReadyStub, nopeFn);
});

test.serial.cb('it should fire the onError callback in case of error', (t) => {
  const err = new Error('error message');
  stub(yaDownload, 'link').callsArgWithAsync(3, err);

  const onErrorStub = stub().callsFake(() => {
    t.true(onErrorStub.calledWithExactly(err), 'should fire onError callback with error object');
    t.end();
  });

  download(token, file, nopeFn, onErrorStub);
});