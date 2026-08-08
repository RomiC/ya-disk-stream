import fs from 'node:fs';

import { download } from '../index.js';

const { API_TOKEN = '' } = process.env;
const fileToSave = fs.createWriteStream('./Mountains.jpg');

const stream = await download(API_TOKEN, 'disk:/Горы.jpg');
stream.pipe(fileToSave);
