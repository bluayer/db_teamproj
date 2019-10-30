const express = require('express');
const router = express.Router();
const Console = console;

router.get('/changeinfo', (req, res, next) => {
  res.render('../views/user/userInfoModify.ejs');
});

module.exports = router;