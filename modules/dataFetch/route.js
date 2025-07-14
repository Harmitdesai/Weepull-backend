const express = require('express');
const { fetchPostController, fetchUserPostController, fetchPostDataController, fetchPostNumberOfAvailableDataController } = require('./controller');

const router = express.Router();

router.get('/post', fetchPostController); // return the total posts
router.post('/userpost', fetchUserPostController); // return the post of a user
router.post('/postdata', fetchPostDataController); // returns the data for a post
router.post('/checkdata', fetchPostNumberOfAvailableDataController); // returns the number of available data for a post

module.exports = router;