const imageMimetype = (img) => {
  const Filemimetype = img?.mimetype;

  if (!Filemimetype.includes("image/")) {
    let err = new Error("Invalid file format -- Please upload an image");
    err.statusCode = 415;
    throw err;
  }
};
module.exports = imageMimetype;
