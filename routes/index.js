const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

router.get('/', controller.index);

router.post('/add', controller.add);

router.post('/delete', controller.delete);

router.post('/edit', controller.adit);

module.exports = router;
