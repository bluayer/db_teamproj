const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  res.render('../views/footprint/index');
});
router.get('/new', (req, res, next) => {
  res.render('../views/footprint/new');
});


module.exports = router;