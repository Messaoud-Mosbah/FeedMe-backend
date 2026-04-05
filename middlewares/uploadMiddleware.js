const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  //path for store files
  destination: (req, file, cb) => {
    // image ou video → dossier différent
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images/");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/videos/");
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
}); //exemple : 1719950200000-482938292.png

// const fileFilter = (req, file, cb) => {
//   const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true)
//   } else {
//     cb(new Error('Unsupported format'), false)
//   }
// }

const fileFilter = (req, file, cb) => {
  if (
    (file.fieldname === "images" || file.fieldname === "image") &&
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

module.exports = upload;
