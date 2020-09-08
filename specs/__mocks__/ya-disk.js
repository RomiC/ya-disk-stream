const download = {
  link: jest.fn((_, __, onSuccess, onError) => {
    download.link._onSuccessCallback = onSuccess;
    download.link._onErrorCallback = onError;
  })
};

const upload = {
  link: jest.fn((_, __, ___, onSuccess, onError) => {
    upload.link._onSuccessCallback = onSuccess;
    upload.link._onErrorCallback = onError;
  })
};

module.exports = {
  download,
  upload
};
