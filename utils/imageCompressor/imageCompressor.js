const { response } = require("express");
const sharp = require("sharp");

const imageCompressor = async (req) => {
  try {
    const convertedimage = await sharp(req?.buffer)
      .webp({
        quality: 50,
        compressionLevel: 7,
      })
      .toBuffer();
    return convertedimage;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { imageCompressor };
