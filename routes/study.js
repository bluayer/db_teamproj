const express = require('express');
const router = express.Router();
const connection = require('./db');
const Console = console;

router.get('/', (req, res, next) => {
  const { session } = req;
  const sql = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO`;
  connection.query(sql, (error, results, fields) => {
    if (error) {
      //error handling plz
    } else {
      res.render('../views/study/index', { session, study : results });
    }
  })
});
// 스터디 등록하기
router.get('/new', (req, res, next) => {
  const { session } = req;
  console.log("등록하기 페이지")
  res.render('../views/study/new', { session });
});

// 스터디 등록하기에서 값 입력하고 등록하기 버튼클릭햇을때 처리
router.post('/create', (req, res, next) => {
  const { session } = req;
  const { user_id } = req.session;
  var easypath_id = parseInt(req.param("easypath_id")); //지금 front에 easypath관련 등록부분이없어서 1로 상수정함

  var study_title = req.param('title');
  var study_content = req.param('content');
  var max_num_people = parseInt(req.param('person_num')); //'1'이렇게 와서 이걸 정수형으로바꿈
  //var cur_num_people = 1; database에서 default값을 1로해주었음
  var study_location = req.param('location');
  //var email = req.param('email'); 이건 데이터베이스 다시수정하면서 없앰

  //<!--데이터넘어 갈때는 1,2,3이렇게 넘어감-->
  //그래서 1일떄 서울, 2일때 경기 이렇게 다시 명시해줘야댐
  if (study_location ==1)
  {
    study_location='서울';
  }
  else if (study_location ==2)
  {
    study_location='경기';
  }
  else if (study_location ==3)
  {
    study_location='인천';
  }

  /*
  console.log(user_id);
  console.log(easypath_id);
  console.log(study_title);
  console.log(study_content);
  console.log(max_num_people);
  console.log(study_location);
  */

  var sql = `INSERT INTO REALLY_FINAL_DB.TBL_STUDY_INFO(user_id, easyPath_id, study_title, study_content, max_num_people, study_location, created_time, updated_time)
VALUES (${user_id}, ${easypath_id}, "${study_title}", "${study_content}", ${max_num_people}, '${study_location}', 0, 0); `;

  var sql2 = `INSERT INTO REALLY_FINAL_DB.TBL_STUDY_PARTICIPANT_INFO (study_id, user_id) 
VALUES ( (SELECT study_id FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE user_id=${user_id} and study_title='${study_title}' and study_content='${study_content}' and max_num_people=${max_num_people} and study_location='${study_location}') 
, ${user_id});`;

  connection.query(sql,(error, results1, fields) => {
    if (error) {//에러가뜨면 이쪽을실행함
      Console.log('error is' + error);
      res.write("<script language=\"javascript\">alert('check easypath id again')</script>"); //alert는알림띄우는거
      res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
      res.end();
    } else { //성공하면 이걸실행함 result에 쿼리결과가들어감
      console.log('\nStudyCreate-1 query success');
      console.log(sql);

      //내가 redirect를 한이유는 http://localhost:3000/study/로 가기위해서임
      //그러면  http://localhost:3000/study/ 가 요청이됥태고
      //그러면 router.get('/', (req, res, next)가 실행이됨 이 기능이 수행되면  study목록을 다가져옴
      //그래서 새로추가한 study정보까지 다불러옴

    connection.query(sql2,(error, results2, fields) => {
      if (error) {//에러가뜨면 이쪽을실행함
        Console.log('error is' + error);
        res.write("<script language=\"javascript\">alert('cant make same study')</script>"); //alert는알림띄우는거
        res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
        res.end();
      } else { //성공하면 이걸실행함 result에 쿼리결과가들어감
        console.log('\nStudyCreate-2 query success');
        console.log(sql2);

        res.redirect("./");

      }
    })
    }
  })


});


// 스터디 가입하기
// 스터디 가입하기 --- 중복있을때 에러핸들링 필
router.post('/apply', (req, res, next) => {
  const { user_id } = req.session;
  const { study_id } = req.body;
  console.log(study_id); // study_id
  console.log(user_id); // user_id who wants applying to study.

  const sql_curNum=`SELECT cur_num_people FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE study_title=${study_id};`
  const sql_maxNum=`SELECT max_num_people FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE study_title=${study_id};`
  const sql=`INSERT INTO REALLY_FINAL_DB.TBL_STUDY_PARTICIPANT_INFO(study_id, user_id)SELECT i.study_id, u.user_id FROM REALLY_FINAL_DB.TBL_STUDY_INFO as i, REALLY_FINAL_DB.TBL_USER_INFO as u
WHERE i.study_id=${study_id} AND u.user_id=${user_id};`;


const requirement1=[study_id];
const requirements=[user_id, study_id];
if(user_id&& study_id){
  if(sql_curNum>=sql_maxNum){   //TODO
    //console.log("OVER MAXIMUM");
      res.write("<script language=\"javascript\">alert('Number of people reached the maximum!')</script>");
      res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
      res.end();
  }
  else{  //현재 인원이 max 인원보다 작을때 추가
    //console.log('ADD!!!');
    connection.query(sql, requirements, (error,results)=>{ //스터디원 추가하기
      if (error){ //에러 메세지
      if(error.code=='ER_DUP_ENTRY'){
          res.write("<script language=\"javascript\">alert('Already Exist!')</script>");
          res.write("<script language=\"javascript\">window.location=\"/study/\"</script>");
          res.end();
        }
        else{
      Console.log('error is'+error);
        res.write("<script language=\"javascript\">alert('Error!!!')</script>");
        res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
        res.end();
      }
      }
      //if(results.length>0){ //추가가 성공적
      else{
        console.log('Insert to study_participant_info Success'+JSON.stringify(results));
        console.log(sql);
      //res.write("<script language=\"javascript\">alert('Welcome! Join Successful!')</script>");
      //res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
    //  res.end();
        const sql_updateNum=`UPDATE REALLY_FINAL_DB.TBL_STUDY_INFO
        SET cur_num_people=cur_num_people+1
        where study_id=${study_id};`;
        connection.query(sql_updateNum,requirement1,(error,results2)=>{  //현재인원수 업데이트
          if (error){
            Console.log('error is'+error);
            res.write("<script language=\"javascript\">alert('Error!!!')</script>");
            res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
            //res.redirect(`/study`);
            res.end();
          }
          else{ //현재인원수 업데이트가 성공적일
            console.log('UPDATE cur_num_people success'+JSON.stringify(results2));
          }
        })
      res.redirect('/')

      }

    })
}
}
});


// 스터디 탈퇴하기
router.post('/getout', (req, res, next) => {
  const { user_id } = req.session;
  const { study_id } = req.body;
  console.log(study_id); // study_id
  console.log(user_id); // user_id who wants getting out of study.
const sql_updateNum=`UPDATE REALLY_FINAL_DB.TBL_STUDY_INFO
SET cur_num_people= (SELECT count(user_id) from REALLY_FINAL_DB.TBL_STUDY_PARTICIPANT_INFO
where study_id=${study_id});`
  const sql=`DELETE FROM REALLY_FINAL_DB.TBL_STUDY_PARTICIPANT_INFO WHERE user_id=${user_id} AND study_id=${study_id};`;
  const requirements=[user_id,study_id];
  const requirement1=[study_id];

if(study_id&&user_id){
  connection.query(sql, requirements,(error,results,fields)=>{
    if (error){
      Console.log('error is'+error);
    }
    else{
      console.log('Getout of study Successful'+JSON.stringify(results));
      console.log(sql);

      connection.query(sql_updateNum,requirement1,(error,results2)=>{  //현재인원수 업데이트
        if (error){
          Console.log('error is'+error);
          res.write("<script language=\"javascript\">alert('Error in updating!!!')</script>");
          res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
          //res.redirect(`/study`);
          res.end();
        }
        else{ //현재인원수 업데이트가 성공적일
          console.log('UPDATE cur_num_people success'+JSON.stringify(results2));
        }
      })
      res.redirect('/');
    }
})
}
});



router.get('/show/:id', (req, res, next) => {
  const { session } = req;
  const { id } = req.params;
  console.log(id); // it's study_id
  const sql_study = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE (study_id = ?)`
  const requirements_study = [id];
  const sql_user = `SELECT username, email FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE (user_id = ?)`

  connection.query(sql_study, requirements_study, (error, results, fields) => {
    // console.log("about study" + results);
    const study = results[0];
    const requirements_user = [study.user_id];
    if (error) {
      // error handling plz
    } else {

      connection.query(sql_user, requirements_user, (error, results2, fields) => {
        if (error) {
          // error handling plz
        } else {
          // console.log("about user" + results2);
          const writer = results2[0];
          res.render('../views/study/show', { session , study, writer });
        }
      })
    }
  })

});

router.post('/new', (req, res, next) => {
  const { session } = req;
  const { easypath_id } = req.body
  console.log(easypath_id); // it's easypath_id that will be linked with new study.
  res.render('../views/study/new', { session });
});


router.get('/posts/search', (req, res, next) => {
  const { session } = req;
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
      res.render('../views/study/index', { session, study : results });

    }
  })


})

module.exports = router;
