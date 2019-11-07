const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  res.render('../views/post/index');
});

router.get('/new', (req, res, next) => {
  res.render('../views/post/new');
});


module.exports = router;