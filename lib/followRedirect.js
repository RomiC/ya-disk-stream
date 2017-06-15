const https = require('https');
const { parse: urlParse } = require('url');

const followRedirect = (url, method = 'GET', onReady) => {
  const req = https.request(
    Object.assign({}, urlParse(url), { method }),
    (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        followRedirect(res.headers.location, method, onReady);
      } else if (res.statusCode === 200 && typeof onReady === 'function') {
        onReady(res);
      }
    }
  );

  req.end();
}

module.exports = followRedirect;