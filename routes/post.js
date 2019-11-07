const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  res.render('../views/post/index');
});


module.exports = router;