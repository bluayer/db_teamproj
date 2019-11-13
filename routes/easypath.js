const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  const { session } = req;
  res.render('../views/easypath/index', { session });
});

router.get('/show', (req, res, next) => {
  const { session } = req;
  res.render('../views/easypath/show', { session });
});

router.get('/new', (req, res, next) => {
  const { session } = req;
  res.render('../views/easypath/new', { session });
});

module.exports = router;