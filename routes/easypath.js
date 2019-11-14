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

router.get('/posts/search', (req, res, next) => {
  console.log("hello")
  const { searchCategory, searchWord } = req.body;
  const sql = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO WHERE user_id = (SELECT user_id FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE username = ?);`;
  const requirements = [searchWord];

  console.log(sql)
}) 


module.exports = router;