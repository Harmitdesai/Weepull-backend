// // modules/data-upload/controller.js
const {uploadTextData, uploadPost} = require('./service');

async function uploadTextDataController(req, res) {
  const { data, email } = req.body;

  try {

    const postId = req.query.postId;

    const response = await uploadTextData(data, email, postId);
    if (response){
        return res.json({ success: true, message: "Text data uploaded successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }  
}

async function uploadPostController(req, res) {
  const { post, email } = req.body;
  try {
    const response = await uploadPost(post, email);
    if (response){
        return res.json({ success: true, message: "Post uploaded successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }

}

module.exports = {
  uploadTextDataController,
  uploadPostController
};
