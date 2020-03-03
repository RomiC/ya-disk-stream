'use strict';

const https = jest.genMockFromModule('https');

const request = jest.fn((_, callback) => {
  request._requestCallback = callback;

  return {
    end: () => {}
  };
});

https.request = request;

module.exports = https;
