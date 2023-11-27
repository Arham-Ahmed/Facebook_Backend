const { response } = require("express");
const sharp = require("sharp");

const imageCompresser = async (req) => {
  try {
    const convertedimage = sharp(req?.buffer).webp({
      quality: 10,
      compressionLevel: 8,
    });
    return await convertedimage.toBuffer();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { imageCompresser };
