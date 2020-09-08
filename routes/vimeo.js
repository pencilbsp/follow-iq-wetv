const express = require('express')
const router = express.Router()
const controller = require('../controllers/vimeo/vimeo')

router.get('/', controller.index)
router.get('/accounts', controller.account)
router.get('/upload', controller.upload)
router.post('/upload', controller.uploadPost)
router.get('/add', controller.add)
router.post('/add', controller.addPost)

module.exports = router