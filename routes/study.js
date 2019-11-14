const express = require('express');
const router = express.Router();
const connection = require('./db');
const Console = console;

router.get('/', (req, res, next) => {
  const { session } = req;
  res.render('../views/study/index', { session });
});

router.get('/show', (req, res, next) => {
  const { session } = req;
  res.render('../views/study/show', { session });
});

router.get('/new', (req, res, next) => {
  const { session } = req;
  res.render('../views/study/new', { session });
});


router.get('/posts/search', (req, res, next) => {
  var searchWord = req.param('searchWord');
  var searchCategory = req.param('searchCategory');

  //consol.log는 printf같아서 디버깅하면댐
  //console.log(searchCategory);

  //if else문에는 sql 작성을하는데 변수는${} 식으로해서 넣음
  if(searchCategory=='author')
  {
  	var sql = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE user_id = (SELECT user_id FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE username = '${searchWord}');`;
  	console.log(sql);
  }
  else
  {
  	var sql = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO
	WHERE study_title LIKE '%${searchWord}%'
	UNION SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO
	WHERE study_title LIKE '%${searchWord}%';`
	console.log(sql)

  }

  //이부분이 sql보내는부분  정우는 requirement가들어갓는데 난오류떠서 뺴버렷음
  connection.query(sql,(error, results, fields) => {
    if (error) {//에러가뜨면 이쪽을실행함
      Console.log('error is' + error);
      res.write("<script language=\"javascript\">alert('unknown input')</script>");	//alert는알림띄우는거
      res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
      res.end();
    } else { //성공하면 이걸실행함 result에 쿼리결과가들어감
      console.log('\nStudy_query success');
      console.log(results);
      res.redirect('/study')

    }
  })

  
}) 

module.exports = router;