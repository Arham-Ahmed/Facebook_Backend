const { response } = require("express");
const sharp = require("sharp");

const imageCompressor = async (req) => {
  try {
    const convertedimage = sharp(req?.buffer).png({
      quality: 20,
      compressionLevel: 9,
    });
    return convertedimage;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { imageCompressor };
