const sharp = require("sharp");
const imageCompresser = async (req) => {
  try {
    // const image = sharp("public/images");
    const convertedimage = sharp(req?.file?.buffer).webp({
      quality: 50,
      compressionLevel: 8,
    });
    return await convertedimage.toBuffer();
  } catch (error) {
    console.log(error);
    return response(500, false, error, res);
  }
  // next();
};

module.exports = { imageCompresser };
