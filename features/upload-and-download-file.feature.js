const fs = require('fs');
const https = require('https');
const path = require('path');
const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');

const { meta, resources } = require('ya-disk');

const { API_TOKEN } = process.env;
const { upload: uploadStream, download: downloadStream } = require('../index');

const shouldRun = API_TOKEN && process.env.GITHUB_ACTOR !== 'dependabot[bot]';
const describeOrSkip = shouldRun ? describe : describe.skip;

const localFileName = path.resolve(
  require.resolve('ya-disk').split('node_modules/')[0],
  'package.json'
);
const localReadStream = fs.createReadStream(localFileName);
const { size: localFileSize } = fs.statSync(localFileName);
const remoteFileName = `package_${Math.round(Math.random() * 100)}.json`;
const remoteFilePath = `disk:/${remoteFileName}`;

function getRemoteFileSize(remoteFile) {
  return new Promise((resolve, reject) => {
    meta.get(
      API_TOKEN,
      remoteFile,
      { fields: 'name,size' },
      ({ size }) => resolve(size),
      reject
    );
  });
}

function uploadFile(token, filePath, stream) {
  return new Promise((resolve, reject) => {
    uploadStream(
      token,
      filePath,
      true,
      (writeStream) => {
        writeStream.on('finish', resolve);
        stream.pipe(writeStream);
      },
      reject
    );
  });
}

function downloadFile(token, filePath, writeStream) {
  return new Promise((resolve, reject) => {
    downloadStream(
      token,
      filePath,
      (readStream) => {
        writeStream.on('finish', resolve);
        readStream.pipe(writeStream);
      },
      reject
    );
  });
}

function removeFile(token, filePath) {
  return new Promise((resolve) => {
    resources.remove(token, filePath, true, resolve, resolve);
  });
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
