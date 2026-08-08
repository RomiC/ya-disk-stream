import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { upload } from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { API_TOKEN = '' } = process.env;
const fileToUpload = fs.createReadStream(path.join(__dirname, 'upload.js'));

try {
  const stream = await upload(
    API_TOKEN,
    'disk:/Приложения/ya-disk-api/upload.js',
    true
  );
  fileToUpload.pipe(stream);
} catch (err) {
  process.stderr.write(err);
}
