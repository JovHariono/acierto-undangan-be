const { upload } = require("../upload");

const uploadMiddleware = (req, res, next) => {
  upload.single("tiket")(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File size exceeds 10MB limit",
      });
    }
    if (err) return next(err);
    next();
  });
};

module.exports = uploadMiddleware;
