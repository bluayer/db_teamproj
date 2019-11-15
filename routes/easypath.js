const express = require('express');
const router = express.Router();
const connection = require('./db');
const Console = console;
//easypath.js는 localhost:3000/easypath/이것저것url 들을 처리하는것
//router.get은 get방식을 처리하고 router.post는 post방식을 처리함
//get방식과 post방식의 차이는 인터넷 검색하면 쉽게 나오니 확인 ㄱㄱ
//router.get이든 router.post든 중요한건 우리가 url을 요청했을때 그 url을 처리하는거임
//router.get('/')같은경우는 localhost:3000/easypath/를 처리하는것이고
//router.get('/posts/search')은 localhost:3000/easypath/posts/search url을 처리함

//localhost:3000/easypath/를 처리
router.get('/', (req, res, next) => {
  const { session } = req;
  const sql = `SELECT * FROM REALLY_FINAL_DB.TBL_EASYPATH_INFO`;
  connection.query(sql, (error, results, fields) => {
    if (error) {
      //error handling plz
    } else {
      console.log(results);
      //res.render는 여기에서 처리한 데이터를 다시 index.ejs로 보내준다는거
      //easypath : results는 뭐냐면
      //console.log(results)를 해보면알겟지만 쿼리를 날리고 그 결과가 results임
      //easypath : results는 results를 easypath라는 이름으로 바꿔서 return해주겠다고 생각하면 될듯
      // 나도 정확히아는건 아님
      //그러면 이제 index.ejs에서 easypath 변수가 여기에서 results가된느거
      //굳이 말하자면 easypath=results; return easypath;  이런느낌
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
});


//localhost:3000/easypath/posts/search?searchCategory=author&searchWord=a 이러한 url이 들어오면 처리
router.get('/posts/search', (req, res, next) => {

  const { session } = req; //이거 무조건 넣어주셈 로그인 세션관련인데 이거안넣어주면 res.render에서 session define 안댔다구 오류남!

  //url에서 ?뒤에오는것들이 데이터값임
  //searchCategory=author&searchWord=a 로 예를들면
  //searchCategory에 author(작성자)값이 들어가고
  //searchWord에 우리가 검색한 단어가 들어감
  //이제 데이터가 넘어왔으니 이데이터를 처리해줘야함 
  //넘어오 데이터를 가져오는방법은 아래 두줄 코드 참고 console.log(req.param)해보는거 추천
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

      //sql쿼리를 보내면 그 결과가 results에 들어오고 그거를 다시 index.ejs에다가 값을 return해주는거임
      //session은 로그인 관련부분이라 그냥 넣어주고 results를 easypath라는 이름으로 return해주는거
      //그러면 index에서는 변수easypath를 사용해서 여기서 보내준 결과값(results)를 사용할수있음
      res.render('../views/easypath/index', { session, easypath : results});

    }
  })


}) 


module.exports = router;
