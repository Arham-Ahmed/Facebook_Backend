const compressImages = require("compress-images");
const { response } = require("../../utils/response");
const imageCompresser = async (req, res, next) => {
  try {
    compressImages(
      "public/images/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}",
      "public/images",
      {
        compress_force: false,
        statistic: true,
        autoupdate: true,
      },
      false,
      { jpg: { engine: mozjpg, command: ["-quality", 60] } },
      { png: { engine: pngquant, command: ["--quality=20-50", "-o"] } },
      { svg: { engine: svgo, command: ["--multipass"] } },
      { gif: { engine: gifsicle, command: ["--color", 64, "--use-col=web"] } },
      function (err, complete) {
        if (err) return response(500, false, err, res);
        if (complete) console.log("done");
      }
    );
  } catch (error) {
    return response(500, false, error, res);
  }
  next();
};

module.exports = { imageCompresser };
