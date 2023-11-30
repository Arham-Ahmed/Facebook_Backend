const { v4: uuidv4 } = require("uuid");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");
const firebase = require("firebase/app");
const { firebaseConfig } = require("../../firebase");
const { response } = require("../../utils/response");
const {
  imageCompressor,
} = require("../../helper/imageCompressor/imageCompressor");

firebase.initializeApp(firebaseConfig);

const storage = getStorage();

const firebaseUploder = async (folder, image) => {
  try {
    const imageBuffer = await imageCompressor(image);
    const fileName = image?.originalname?.split(".")[0];
    const storageRef = ref(storage, `${folder}/${fileName + uuidv4()}`);
    const metadata = {
      contentType: "webp",
    };
    const uploadedFile = await uploadBytesResumable(
      storageRef,
      imageBuffer,
      metadata
    );
    const downloadUrl = await getDownloadURL(uploadedFile?.ref);
    return downloadUrl;
  } catch (error) {}
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
module.exports = { firebaseUploder, firebaseImageDelete };
