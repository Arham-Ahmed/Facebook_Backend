const sharp = require("sharp");
const imageCompresser = async (req, res, next) => {
  try {
    // const image = sharp("public/images");
    const jpeg = await sharp(req?.file?.buffer).jpeg({
      quality: 1,
      compressionLevel: 6,
    });
    // .toFile(
    //   `public/images/${new Date(
    //     Date.now()
    //   ).getTime()}${req.file.originalname.replace(
    //     /\W|jpeg|jpg|png/g,
    //     ""
    //   )}.jpeg`
    // );
    console.log(await jpeg.toBuffer());
    return await jpeg.toBuffer();
    // return jpeg;
    // if (jpeg.size > 1800) {
    //   // const img = sharp(req?.file.buffer);
    //   // console.log(jpeg);
    //   // return img.toBuffer();
    // } else {
    //   // console.log(jpeg);
    //   // return img.toBuffer();
    //   // const img = sharp(req?.file.buffer);
    //   // console.log(await img.toBuffer());
    // }
    // return response(200, true, "imageUploaded", res);
  } catch (error) {
    console.log(error);
    // return response(500, false, error, res);
  }
  // next();
};

module.exports = { imageCompresser };
