const firebaseUploder = require("../firebaseHelper/firebaseUploader");
const imageMimetype = require("../imageHelper/imageMimeType");

const imageUploader = async (key, req, action) => {
  const img = req?.files?.[key][0];
  imageMimetype(img);
  //   firebase Image Uploading ...
  action?.[key]?.push(await firebaseUploder(`${[key]}`, img));
  // return await action.save();
};
module.exports = imageUploader;
