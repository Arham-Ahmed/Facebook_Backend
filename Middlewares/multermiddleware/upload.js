const multer = require("multer");
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
const sharp = require("sharp");

firebase.initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

//res, req, index,
const firebaseUploder = async (folder, image) => {
  // const imageBuffer = await sharp(image[0].input).toBuffer();
  const imageBuffer = await image?.options?.input?.buffer;
  console.log(
    "🚀 ~ file: upload.js:24 ~ firebaseUploder ~ imageBuffer:",
    image?.options?.input?.buffer
  );
  // const fileName = Object?.values(req?.files)[0][
  //   req?.files[0]?.length - 1
  // ]?.originalname?.split(".")[0];
  const fileName = image[0]?.originalname?.split(".")[0];

  const storageRef = ref(storage, `${folder}/${fileName + uuidv4()}`);
  const metadata = {
    contentType: "png",
  };
  const uploadedFile = await uploadBytesResumable(
    storageRef,
    imageBuffer,
    metadata
  );

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
