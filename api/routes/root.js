const express = require('express');
const c = require('../controllers/root');

const router = express.Router();

router.get('/', c.rootQuery);

module.exports = router;