const express = require('express');
const router = express.Router();
const connection = require('./db');
const Console = console;

router.get('/', (req, res, next) => {
  const { session } = req;
  const sql = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO`;
  connection.query(sql, (error, results, fields) => {
    if (error) {
      //error handling plz
    } else {
      res.render('../views/easypath/index', { session, easypath : results});
    }
  });
});

router.get('/show/:id', (req, res, next) => {
  const { session } = req;
  const { id } = req.params;
  console.log(id); 
  const sql_easy = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO WHERE (easypath_id = ?)`
  const requirements_easy = [id];
  const sql_user = `SELECT username, email FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE (user_id = ?)`
  const sql_specific = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_SPECIFIC_INFO WHERE (easypath_id = ?) ORDER BY specific_num`
  const requirements_specific = [id];

  connection.query(sql_easy, requirements_easy, (error, results, fields) => {
    // console.log("about study" + results);
    const easypath = results[0];
    const requirements_user = [easypath.user_id];
    if (error) {
      // error handling plz
    } else {
      
      connection.query(sql_user, requirements_user, (error, results2, fields) => {
        if (error) {
          // error handling plz
        } else {
          const writer = results2[0];
          
          connection.query(sql_specific, requirements_specific, (error, results3, fields) => {
            if (error) {
              console.log(error);
            }
            const specific = results3;
            // console.log("Specific is " + JSON.stringify(specific));
            res.render('../views/easypath/show', { session , easypath, writer, specific: results3 });
          })
          // console.log("about user" + results2);
          
        }
      })
    }
  })

});

router.get('/new', (req, res, next) => {
  const { session } = req;
  res.render('../views/easypath/new', { session });
});

router.post('/create', (req, res, next) => {
  console.log(req.body);

  const { user_id } = req.session
  var easypathTitle = req.param('name')[0];
  var easypathContent = req.param('name')[1];
  var easypathCategory = req.param('category');
  var numberOfSpecifies = req.param('cnt') - 1;
  console.log(user_id);
  console.log(easypathTitle);
  console.log(easypathContent);
  console.log(easypathCategory);
  console.log(numberOfSpecifies);

  var easypathSQL = `
  INSERT INTO REALLY_FINAL_DB.TBL_EASYPATH_INFO
  (user_id, easypath_title, specific_cnt, easypath_content, recommend_cnt, category, created_time, updated_time)
  VALUES (${user_id}, '${easypathTitle}', 0, '${easypathContent}', 0, '${easypathCategory}', utc_timestamp(), utc_timestamp())
  `;

  connection.query(easypathSQL, (error, results, fields) => {
    if (error) {
      Console.log('error is' + error);
      res.write("<script language=\"javascript\">alert('unknown input')</script>");
      res.write("<script language=\"javascript\">window.location=\"/easypath\"</script>");
      res.end();
    } else {
      console.log('\nEasypath register query success!');
      console.log(results);

      connection.query(`SELECT LAST_INSERT_ID();`, (error, results, fields) => {
        if (error) {
          Console.log('error is' + error);
          res.write("<script language=\"javascript\">alert('unknown input')</script>");
          res.write("<script language=\"javascript\">window.location=\"/easypath\"</script>");
          res.end();
        } else {
          console.log('\nSuccessfully got the easypath query!!');
          var easypath_id = results[0]["LAST_INSERT_ID()"];
          
          for (var i = 1; i <= numberOfSpecifies; i++) {
            var specificTitle = req.param('tb' + '1' + '_' + i);
            var specificURL = req.param('tb' + '2' + '_' + i);
            var specificContent = req.param('tb' +'3' + '_' + i);
    
            console.log(easypath_id);
            console.log(i);
            console.log(specificTitle);
            console.log(specificURL);
            console.log(specificContent);

            var specificSQL = `
            INSERT INTO REALLY_FINAL_DB.TBL_EASYPATH_SPECIFIC_INFO
            (easypath_id, specific_num, specific_title, specific_content, specific_url)
            VALUES (${easypath_id}, ${i}, '${specificTitle}', '${specificContent}', '${specificURL}')`;
  
            connection.query(specificSQL, (error, results, fields) => {
              if (error) {
                Console.log('error is' + error);
                res.write("<script language=\"javascript\">alert('unknown input')</script>");
                res.write("<script language=\"javascript\">window.location=\"/easypath\"</script>");
                res.end();
              } else {
                console.log('\nEasypath specific register query success!');
                console.log(results);
              }
            })
          }
          res.redirect('/easypath')
        }
      })
    }
  })
});

router.get('/posts/search', (req, res, next) => {
  var searchWord = req.param('searchWord');
  var searchCategory = req.param('searchCategory');

  //consol.log는 printf같아서 디버깅하면댐
  //console.log(searchCategory);

  //if else문에는 sql 작성을하는데 변수는${} 식으로해서 넣음
  if(searchCategory=='author')
  {
  	var sql = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO WHERE user_id = (SELECT user_id FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE username = '${searchWord}');`;
  	console.log(sql);
  }
  else
  {
  	var sql = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO
	WHERE easypath_title LIKE '%${searchWord}%'
	UNION SELECT *
	FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO
	WHERE easypath_content LIKE '%${searchWord}%';`
	console.log(sql)

  }

  //이부분이 sql보내는부분  정우는 requirement가들어갓는데 난오류떠서 뺴버렷음
  connection.query(sql,(error, results, fields) => {
    if (error) {//에러가뜨면 이쪽을실행함
      Console.log('error is' + error);
      res.write("<script language=\"javascript\">alert('unknown input')</script>");	//alert는알림띄우는거
      res.write("<script language=\"javascript\">window.location=\"/easypath\"</script>");
      res.end();
    } else { //성공하면 이걸실행함 result에 쿼리결과가들어감
      console.log('\nStudy_query success');
      console.log(results);
      res.redirect('/easypath')

    }
  })


}) 


module.exports = router;
