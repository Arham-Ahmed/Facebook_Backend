const firebase = require("firebase/app");
const { ref, deleteObject, getStorage } = require("firebase/storage");
const { firebaseConfig } = require("../../Config/firebaseConfig/firebase");

firebase.initializeApp(firebaseConfig);
const storage = getStorage();

const firebaseImageDelete = async (deleteImagPath) => {
  const deletRef = ref(storage, deleteImagPath);
  await deleteObject(deletRef);
};

module.exports = firebaseImageDelete;
