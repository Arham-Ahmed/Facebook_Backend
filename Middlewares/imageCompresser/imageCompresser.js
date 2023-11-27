const sharp = require("sharp");
const imageCompresser = async (req) => {
  try {
    // const image = sharp("public/images");
    const convertedimage = sharp(req?.file?.buffer).resize(300, 300).webp({
      quality: 50,
      compressionLevel: 8,
    });
    // .toFile(
    //   `public/images/${new Date(
    //     Date.now()
    //   ).getTime()}${req.file.originalname.replace(
    //     /\W|convertedimage|jpg|png/g,
    //     ""
    //   )}.png`
    // );
    // console.log(await convertedimage.toBuffer());
    // return await convertedimage.toBuffer();
    return await convertedimage.toBuffer();
    // return convertedimage;
    // if (convertedimage.size > 1800) {
    //   // const img = sharp(req?.file.buffer);
    //   // console.log(convertedimage);
    //   // return img.toBuffer();
    // } else {
    //   // console.log(convertedimage);
    //   // return img.toBuffer();
    //   // const img = sharp(req?.file.buffer);
    //   // console.log(await img.toBuffer());
    // }
    // return response(200, true, "imageUploaded", res);
  } catch (error) {
    console.log(error);
    return response(500, false, error, res);
  }
  // next();
};

module.exports = { imageCompresser };
