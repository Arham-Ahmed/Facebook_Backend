const { ref, deleteObject, getStorage } = require("firebase/storage");
const firebase = require("firebase/app");
const { firebaseConfig } = require("../../Config/firebaseConfig/firebase");
const { response } = require("../../utils/response");

const storage = getStorage();
firebase.initializeApp(firebaseConfig);

const firebaseImageDelete = async (deleteImagPath) => {
  const deletRef = ref(storage, deleteImagPath);
  deleteObject(deletRef);
};

module.exports = { firebaseImageDelete };
