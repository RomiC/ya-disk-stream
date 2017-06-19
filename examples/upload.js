import fs from 'fs';
import path from 'path';

import { upload } from '../index';

const API_TOKEN = '';
const fileToUpload = fs.createReadStream(path.join(__dirname, 'upload.js'));

upload(
  API_TOKEN,
  'disk:/upload.js',
  true,
  (stream) => fileToUpload.pipe(stream),
  (err) => process.stderr.write(err)
);