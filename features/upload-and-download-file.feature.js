import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { meta, resources } from 'ya-disk';

const { API_TOKEN } = process.env;
const { upload: uploadStream, download: downloadStream } =
  await import('../index.js');

const shouldRun = API_TOKEN && process.env.GITHUB_ACTOR !== 'dependabot[bot]';
const describeOrSkip = shouldRun ? describe : describe.skip;

const yaDiskPath = fileURLToPath(import.meta.resolve('ya-disk'));
const localFileName = path.resolve(
  yaDiskPath.split('node_modules/')[0],
  'package.json'
);
const localReadStream = fs.createReadStream(localFileName);
const { size: localFileSize } = fs.statSync(localFileName);
const remoteFileName = `package_${Math.round(Math.random() * 100)}.json`;
const remoteFilePath = `disk:/${remoteFileName}`;

async function getRemoteFileSize(remoteFile) {
  const { size } = await meta.get(API_TOKEN, remoteFile, {
    fields: 'name,size'
  });
  return size;
}

async function uploadFile(token, filePath, stream) {
  const writeStream = await uploadStream(token, filePath, true);
  const { promise, resolve, reject } = Promise.withResolvers();
  writeStream.on('finish', resolve);
  writeStream.on('error', reject);
  stream.pipe(writeStream);
  return promise;
}

async function downloadFile(token, filePath, writeStream) {
  const readStream = await downloadStream(token, filePath);
  const { promise, resolve, reject } = Promise.withResolvers();
  writeStream.on('finish', resolve);
  writeStream.on('error', reject);
  readStream.pipe(writeStream);
  return promise;
}

async function removeFile(token, filePath) {
  await resources.remove(token, filePath, true);
}

let localWriteStream;

describeOrSkip('uploading and downloading file', () => {
  before(() => {
    localWriteStream = fs.createWriteStream(remoteFileName);
  });

  after(async () => {
    fs.unlinkSync(remoteFileName);
    await removeFile(API_TOKEN, remoteFilePath);
    https.globalAgent.destroy();
  });

  it('should upload file', async () => {
    await uploadFile(API_TOKEN, remoteFilePath, localReadStream);
    // Wait for the file to be available on the server
    await new Promise((r) => setTimeout(r, 5000));
    const size = await getRemoteFileSize(remoteFilePath);
    assert.strictEqual(size, localFileSize);
  });

  it('should download file', async () => {
    await downloadFile(API_TOKEN, remoteFilePath, localWriteStream);
    const size = fs.statSync(remoteFileName).size;
    // Verify the downloaded file exists on the server
    const remoteSize = await getRemoteFileSize(remoteFilePath);
    assert.strictEqual(remoteSize, size);
  });
});
