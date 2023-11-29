const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
  listAll,
  list,
} = require("firebase/storage");
const firebase = require("firebase/app");
const { firebaseConfig } = require("../../firebase");
const { response } = require("../../utils/response");

firebase.initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

const firebaseUploder = async (res, req, index, folder, image) => {
  const fileName = Object?.values(req?.files)[0][index]?.originalname?.split(
    "."
  )[0];

  const storageRef = ref(storage, `${folder}/${fileName + uuidv4()}`);
  const metadata = {
    contentType: "webp",
  };
  const uploadedFile = await uploadBytesResumable(storageRef, image, metadata);

  // if (!uploadedFile)
  //   return response(
  //     res,
  //     500,
  //     false,
  //     "Error on uploading iamge on Firebase line 53"
  //   );
  const downloadUrl = await getDownloadURL(uploadedFile?.ref);
  return downloadUrl;
};

const firebaseImageDelete = async (deleteImagPath, res) => {
  try {
    const deletRef = ref(storage, deleteImagPath);
    const deleteImg = await deleteObject(deletRef);
  } catch (error) {
    return response(
      res,
      500,
      `error on upload.js line no 49  : error : ${error.message} `
    );
  }
};
module.exports = { upload, firebaseUploder, firebaseImageDelete };
