const multer = require('multer');
const AppError = require('../utils/AppError');

const ACCEPTED_MIME = 'application/pdf';
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new AppError('No file provided', 400));
  }
  if (file.mimetype !== ACCEPTED_MIME) {
    return cb(
      new AppError('Invalid file type. Only PDF files are allowed.', 400)
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const uploadSinglePdf = upload.single('file');

const handleUpload = (req, res, next) => {
  uploadSinglePdf(req, res, (err) => {
    if (err instanceof AppError) {
      return next(err);
    }
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File size exceeds 20MB limit.', 400));
      }
      return next(new AppError('File upload failed.', 400));
    }
    if (!req.file) {
      return next(new AppError('No file provided.', 400));
    }
    next();
  });
};

module.exports = { handleUpload };
