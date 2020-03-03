const followRedirect = jest.fn((_, __, onReady) => {
  followRedirect._onReady = onReady;
});

module.exports = followRedirect;
