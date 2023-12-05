const { v4: uuidv4 } = require("uuid");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const firebase = require("firebase/app");
const { firebaseConfig } = require("../../Config/firebaseConfig/firebase");
const { imageCompressor } = require("../imageCompressor/imageCompressor");
const { response } = require("../../utils/response");

firebase.initializeApp(firebaseConfig);

const storage = getStorage();

const firebaseUploder = async (folder, image) => {
  try {
    const imageBuffer = await imageCompressor(image);
    const fileName = image?.originalname?.split(".")[0].replaceAll(" ", "");
    const storageRef = ref(storage, `${folder}/${fileName + "2F" + uuidv4()}`);
    const metadata = {
      contentType: "webp",
    };
    const uploadedFile = await uploadBytesResumable(
      storageRef,
      imageBuffer,
      metadata
    );
    return await getDownloadURL(uploadedFile?.ref);
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};

module.exports = { firebaseUploder };
