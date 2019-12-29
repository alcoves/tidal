const express = require('express');
const c = require('../controllers/conversions');

const router = express.Router();

router.post('/videos/:id', c.createVideo);

module.exports = router;
