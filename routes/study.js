const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  res.render('../views/study/index');
});

router.get('/show', (req, res, next) => {
  res.render('../views/study/show');
});

router.get('/new', (req, res, next) => {
  res.render('../views/study/new');
});


module.exports = router;