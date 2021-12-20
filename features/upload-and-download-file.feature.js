const fs = require('fs');
const path = require('path');
const { meta, resources } = require('ya-disk');

const { API_TOKEN = process.env.API_TOKEN } = require('dotenv').config();
const { upload: uploadStream, download: downloadStream } = require('../index');

jest.unmock('ya-disk');

const localFileName = path.resolve(
  require.resolve('ya-disk').split('node_modules/')[0],
  'package.json'
);
const localReadStream = fs.createReadStream(localFileName);
const { size: localFileSize } = fs.statSync(localFileName);
const remoteFileName = `package_${Math.round(Math.random() * 100)}.json`;
const remoteFilePath = `disk:/${remoteFileName}`;
const localWriteStream = fs.createWriteStream(remoteFileName);

function checkRemoteFileSize(remoteFile, expectedSize, onSuccess) {
  meta.get(
    API_TOKEN,
    remoteFile,
    { fields: 'name,size' },
    ({ size }) => {
      expect(size).toBe(expectedSize);
      onSuccess();
    },
    (err) => {
      console.error(`Failed to get ${remoteFile} file meta!`);
      throw err;
    }
  );
}

describe('uploading and downloading file', () => {
  afterAll((done) => {
    fs.unlinkSync(remoteFileName);
    resources.remove(API_TOKEN, remoteFilePath, true, done, done);
  });

  it('should upload file', (done) => {
    uploadStream(
      API_TOKEN,
      remoteFilePath,
      true,
      (stream) => {
        stream.on('finish', () => {
          setTimeout(
            () => checkRemoteFileSize(remoteFilePath, localFileSize, done),
            5000
          );
        });
        localReadStream.pipe(stream);
      },
      (err) => {
        console.error('Failed to create the upload stream!');
        throw err;
      }
    );
  });

  it('should download file', (done) => {
    downloadStream(
      API_TOKEN,
      remoteFilePath,
      (stream) => {
        localWriteStream.on('finish', () =>
          checkRemoteFileSize(
            remoteFilePath,
            fs.statSync(remoteFileName).size,
            done
          )
        );
        stream.pipe(localWriteStream);
      },
      (err) => {
        console.error('Failed to create the download stream!');
        throw err;
      }
    );
  });
});
