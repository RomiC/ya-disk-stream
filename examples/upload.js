import fs from 'fs';
import path from 'path';

import { upload } from '../index';

const { API_TOKEN = '' } = process.env;
const fileToUpload = fs.createReadStream(path.join(__dirname, 'upload.js'));

upload(
  API_TOKEN,
  'disk:/Приложения/ya-disk-api/upload.js',
  true,
  (stream) => fileToUpload.pipe(stream),
  (err) => process.stderr.write(err)
);