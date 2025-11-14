const express = require('express');
const { fetchPostController, fetchUserPostController, fetchPostDataController, fetchPostNumberOfAvailableDataController, getBalanceController, getOrderDataController } = require('./controller');

const router = express.Router();

router.get('/post', fetchPostController); // return the total posts
router.post('/userpost', fetchUserPostController); // return the post of a user
router.post('/postdata', fetchPostDataController); // returns the data for a post
router.post('/getAvailableDatapoints', fetchPostNumberOfAvailableDataController); // returns the number of available data for a post
router.post('/balance', getBalanceController); // returns the balance for a user
router.post('/download', getOrderDataController); // send back zip file for order data

module.exports = router;