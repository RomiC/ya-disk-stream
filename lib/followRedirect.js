import https from 'node:https';

export function followRedirect(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const makeRequest = (url) => {
      const req = https.request(url, { method }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          res.destroy();
          makeRequest(res.headers.location);
        } else if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject(new Error(`Unexpected status code: ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.end();
    };

    makeRequest(url);
  });
}
