// // ./modules/data-upload/routes.js
const express = require('express');
const { uploadTextDataController, uploadPostController } = require('./controller');

const router = express.Router();

router.post('/text', uploadTextDataController);

router.post('/post', uploadPostController);

module.exports = router;