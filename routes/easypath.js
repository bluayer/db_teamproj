const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  res.render('../views/easypath/index');
});

router.get('/show', (req, res, next) => {
  res.render('../views/easypath/show');
});

router.get('/new', (req, res, next) => {
  res.render('../views/easypath/new');
});


module.exports = router;