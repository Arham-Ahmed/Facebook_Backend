const sharp = require("sharp");

const imageCompressor = async (image) => {
  const convertedimage = sharp(image?.buffer)
    .webp({
      quality: 20,
      compressionLevel: 9,
    })
    .toBuffer();
  return convertedimage;
};

module.exports = imageCompressor;
