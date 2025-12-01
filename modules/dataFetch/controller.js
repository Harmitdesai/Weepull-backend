const { fetchPost, fetchUserPost, fetchPostData, fetchPostNumberOfAvailableData, getBalance, getOrderData } = require('./service');
const archiver = require('archiver');
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
    const { post_id } = req.body;
    try {
        
        const response = await fetchPostNumberOfAvailableData(post_id);
        return res.json({ success: true, data: response});
    
    } catch(error) {

        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });

    }
}

async function getBalanceController(req, res) {
    const { email } = req.body;
    try {

        const response = await getBalance(email);
        return res.json({ success: true, data: {balance: response} });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error on while fetching user's balance" });
    }
}

async function getOrderDataController(req, res) {
    const { order_id } = req.body;

    try {
        const response = await getOrderData(order_id);
        console.log("Order Data Response:", response);

        const textContent = response.join('\n');

        // Set response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="order_${order_id}.zip"`);

        // Create zip and add single .txt file
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        archive.append(textContent, { name: `order_${order_id}.txt` });
        await archive.finalize();
    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error on while fetching order data" });
    }

}

module.exports = {
  fetchPostController,
  fetchUserPostController,
  fetchPostDataController,
  fetchPostNumberOfAvailableDataController,
  getBalanceController,
  getOrderDataController
};