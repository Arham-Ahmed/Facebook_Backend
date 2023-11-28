const { response } = require("express");
const sharp = require("sharp");

const imageCompressor = async (req) => {
  try {
    const convertedimage = sharp(req?.buffer).webp({
      quality: 50,
      compressionLevel: 7,
    });
    return await convertedimage.toBuffer();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { imageCompressor };
