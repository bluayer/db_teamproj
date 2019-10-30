const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  res.render('../views/index');
});

router.get('/login', (req, res, next) => {
  res.render('../views/user/login');
});

router.get('/signup', (req, res, next) => {
  res.render('../views/user/signup');
});

module.exports = router;