const multer = require("multer");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");
const firebase = require("firebase/app");
const { firebaseConfig } = require("../../firebase");

firebase.initializeApp(firebaseConfig);

// const fileDestination = (req, file, cb /*callback*/) => {
//   if (!fs?.existsSync("public")) {
//     fs?.mkdir("public");
//   }
//   if (!fs?.existsSync("public/images")) {
//     fs?.mkdir("public/images");
//   }
//   cb(null, "public/images");
// };
// const filename = (req, file, cb) => {
//   cb(null, Date?.now() + file?.originalname);
// };
// const storage = multer?.diskStorage({
//   destination: fileDestination,
//   filename: filename,
// });

// const filefilter = (req, file, cb) => {
//   if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//     cb(null, true);
//   } else {
//     cb(new Error("Unsupported File Format"));
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: filefilter,
// });

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const firebaseUploder = async (folder, image, req) => {
  const storageRef = ref(
    storage,
    `${folder}/${req?.file?.originalname + " " + " " + new Date()?.getTime()}`
  );
  const metadata = {
    contentType: "webp",
  };
  const uploadedFile = await uploadBytesResumable(storageRef, image, metadata);

  if (!uploadedFile)
    return response(
      500,
      false,
      "Error on uploading iamge on Firebase line 53",
      res
    );
  const downloadUrl = await getDownloadURL(uploadedFile.ref);
  return downloadUrl;
};

const firebaseImageDelete = async (folder, image, req) => {
  const storageRef = ref(
    storage,
    `${folder}/${req?.file?.originalname + " " + " " + new Date()?.getTime()}`
  );
  return await deleteObject(deleteRef);
};
module.exports = { upload, firebaseUploder };
