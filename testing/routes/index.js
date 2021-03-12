const express = require('express')
const router = express.Router()
const resourceController = require('../controllers/resourceController')

/* Create routes for each controller in your application. */
router
  .get('/resource', resourceController.index)

module.exports = router
