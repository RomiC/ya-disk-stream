import fs from 'fs';

import { download } from '../index';

const { API_TOKEN = '' } = process.env;
const fileToSave = fs.createWriteStream('./Mountains.jpg');

const stream = await download(API_TOKEN, 'disk:/Горы.jpg');
stream.pipe(fileToSave);
