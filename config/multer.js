import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = `uploads/temp`;
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      req.uploadType +
      "_" +
      Date.now() +
      "_" +
      req.user.id +
      "_" +
      req.params.processId;
    cb(null, uniqueSuffix);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(null, false);
};

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) cb(null, true);
  else cb(null, false);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 1024 * 1024 * 500 },
});

export { uploadImage, uploadVideo };
