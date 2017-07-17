# ya-disk-stream [![Build Status](https://travis-ci.org/RomiC/ya-disk-stream.svg?branch=master)](https://travis-ci.org/RomiC/ya-disk-stream) [![codecov](https://codecov.io/gh/RomiC/ya-disk-stream/branch/master/graph/badge.svg)](https://codecov.io/gh/RomiC/ya-disk-stream)

[![Greenkeeper badge](https://badges.greenkeeper.io/RomiC/ya-disk-stream.svg)](https://greenkeeper.io/)

Create readable and writable streams for downloading and uploading files to Yandex.Disk.

## Authorization

Each method requires an OAuth token. You can receive one manually or use one of OAuth library, i.e. [passport-yandex-token](https://github.com/ghaiklor/passport-yandex-token).

## Methods

### download(token, path, [onReady], [onError])

Creates readable stream for downloading file from Yandex.Disk.

```js
import fs from 'fs';

import { download } from 'ya-disk-stream';

const API_TOKEN = '9182h178d871gd8g23kwjehkwehr9';
const fileToSave = fs.createWriteStream('./Mountains.jpg');

downloadStream(API_TOKEN, 'disk:/Горы.jpg', (download) => download.pipe(fileToSave));
```

### upload(token, path, [overwrite=true], [onReady], [onError])

Creates writable stream for uploading file to Yandex.Disk.

```js
import fs from 'fs';
import path from 'path';

import { upload } from 'ya-disk-stream';

const API_TOKEN = '9182h178d871gd8g23kwjehkwehr9';
const fileToUpload = fs.createReadStream(path.join(__dirname, 'upload.js'));

uploadStream(
  API_TOKEN,
  'disk:/upload.js',
  true,
  (stream) => fileToUpload.pipe(stream),
  (err) => process.stderr.write(err)
);
```