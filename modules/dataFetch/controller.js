const { fetchPost, fetchUserPost, fetchPostData, fetchPostNumberOfAvailableData } = require('./service');

async function fetchPostController(req, res) {

    try {
        
        const response = await fetchPost();
        return res.json({ success: true, data: response });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

async function fetchUserPostController(req, res) {
    const { email } = req.body;
    try {

        const response = await fetchUserPost(email);
        return res.json({ success: true, data: response });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

async function fetchPostDataController(req, res) {
    const { postId, total } = req.body;
    try {

        const response = await fetchPostData(postId, total);
        return res.json({ success: true, data: response });
    
    } catch(error) {

        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });

    }
}

async function fetchPostNumberOfAvailableDataController(req, res) {
    const { postId } = req.body;
    try {

        const response = await fetchPostNumberOfAvailableData(postId);
        return res.json({ success: true, data: response});
    
    } catch(error) {

        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });

    }
}

module.exports = {
  fetchPostController,
  fetchUserPostController,
  fetchPostDataController,
  fetchPostNumberOfAvailableDataController
};