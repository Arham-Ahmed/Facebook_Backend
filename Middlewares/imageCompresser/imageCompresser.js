const sharp = require("sharp");
const { response } = require("../../utils/response");
const imageCompresser = async (req, res, next) => {
  try {
    console.log(req.file);
    // const image = sharp("public/images");
    const jpeg = await sharp(req?.file?.buffer)
      .resize(300, 300)
      .png()
      .tiff({
        compression: "lzw",
        bitdepth: 8,
      })
      .toFile(
        `public/images/${new Date(
          Date.now()
        ).getTime()}${req.file.originalname.replace(
          /\W|jpeg|jpg|png/g,
          ""
        )}.png`
      );
    // if (jpeg.size > 1800) {
    //   const img = sharp(req?.file.buffer);
    //   console.log(img.toBuffer());
    //   // return img.toBuffer();
    // } else {
    //   // return img.toBuffer();
    //   const img = sharp(req?.file.buffer);
    //   console.log(await img.toBuffer());
    // }
    return response(200, true, "imageUploaded", res);
  } catch (error) {
    console.log(error);
    return response(500, false, error, res);
  }
  next();
};

module.exports = { imageCompresser };
