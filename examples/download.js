const fs = require('fs');

const downloadStream = require('../lib/download');

const API_TOKEN = 'AQAAAAAbX24dAARco6CIrFDsfUXupTjn9ogeowA';
const fileToSave = fs.createWriteStream('./Mountains.jpg');

downloadStream(API_TOKEN, 'disk:/Горы.jpg', (download) => download.pipe(fileToSave));
