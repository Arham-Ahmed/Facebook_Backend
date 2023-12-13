const firebaseUploder = require("../firebaseHelper/firebaseUploader");
const imageMimetype = require("../imageHelper/imageMimeType");
const imageUploader = async (key, req, action) => {
  const img = req?.files?.[key][0];
  //   Image mimeType Checker ...
  imageMimetype(img);
  //   firebase Image Uploading ...
  return await firebaseUploder(`${[key]}`, img);
};
module.exports = imageUploader;
