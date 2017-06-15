const fs = require('fs');
const path = require('path');

const uploadStream = require('../lib/upload');

const API_TOKEN = 'AQAAAAAbX24dAARco6CIrFDsfUXupTjn9ogeowA';
const fileToUpload = fs.createReadStream(path.join(__dirname, 'upload.js'));

uploadStream(
  API_TOKEN,
  'disk:/upload.js',
  true,
  (stream) => fileToUpload.pipe(stream),
  (err) => process.stderr.write(err)
);