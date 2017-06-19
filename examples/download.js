import fs from 'fs';

import { download } from '../index';

const API_TOKEN = '';
const fileToSave = fs.createWriteStream('./Mountains.jpg');

download(API_TOKEN, 'disk:/Горы.jpg', (download) => download.pipe(fileToSave));
