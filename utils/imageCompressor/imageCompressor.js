const sharp = require("sharp");

const imageCompressor = async (req) => {
  const convertedimage = sharp(req?.buffer)
    .png({
      quality: 20,
      compressionLevel: 9,
    })
    .toBuffer();
  return convertedimage;
};

module.exports = { imageCompressor };
