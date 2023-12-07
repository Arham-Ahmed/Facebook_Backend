const imagePathMaker = (image) => {
  return image
    .split("/")
    [image.split("/").length - 1].replaceAll("%", "")
    .split("?")[0]
    .replace("2F", "/");
};

module.exports = imagePathMaker;
