const express = require('express');
const router = express.Router();
const connection = require('./db');
const Console = console;

router.get('/', (req, res, next) => {
  const { session } = req;
  const sql = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO`;
  console.log(session);
  connection.query(sql, (error, results, fields) => {
    if (error) {
      //error handling plz
    } else {
      console.log(results);
      // console.log(typeof results[35].created_time);
      res.render('../views/study/index', { session, study : results });
    }
  })
});


// 스터디 등록하기
router.post('/new', (req, res, next) => {
  const { session } = req;
  const { easypath_id } = req.body
  console.log("등록하기 페이지")
  res.render('../views/study/new', { session, easypath_id });
});
// 스터디 등록하기에서 값 입력하고 등록하기 버튼클릭햇을때 처리
router.post('/create', (req, res, next) => {
  const { session } = req;
  const { user_id } = req.session;
  const { easypath_id, study_title, study_content, study_location } = req.body; 

  var max_num_people = parseInt(req.param('person_num')); //'1'이렇게 와서 이걸 정수형으로바꿈
  //var cur_num_people = 1; database에서 default값을 1로해주었음

/*
  console.log(user_id);
  console.log(easypath_id);
  console.log(study_title);
  console.log(study_content);
  console.log(max_num_people);
  console.log(study_location);
*/

  var sql = `INSERT INTO REALLY_FINAL_DB.TBL_STUDY_INFO(user_id, easyPath_id, study_title, study_content, max_num_people, study_location, created_time, updated_time)
VALUES (${user_id}, ${easypath_id}, "${study_title}", "${study_content}", ${max_num_people}, '${study_location}', CONVERT_TZ(NOW(), 'SYSTEM', '+09:00'), CONVERT_TZ(NOW(), 'SYSTEM', '+09:00'));`;

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
      console.log("are you fool??\n");
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

//  const sql_curNum=`SELECT cur_num_people FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE study_title=${study_id};`
//  const sql_maxNum=`SELECT max_num_people FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE study_title=${study_id};`
  const sql_compare=`SELECT cur_num_people,max_num_people FROM REALLY_FINAL_DB.TBL_STUDY_INFO where study_id=${study_id};`;

  const sql=`INSERT INTO REALLY_FINAL_DB.TBL_STUDY_PARTICIPANT_INFO(study_id, user_id)SELECT i.study_id, u.user_id FROM REALLY_FINAL_DB.TBL_STUDY_INFO as i, REALLY_FINAL_DB.TBL_USER_INFO as u
WHERE i.study_id=${study_id} AND u.user_id=${user_id};`;


const requirement1=[study_id];
const requirements=[user_id, study_id];
const requirements_compare=[study_id];
if(user_id&& study_id){
connection.query(sql_compare, requirements_compare,(error,result1)=>{
  if (error){
    console.log('error is'+error);
    res.write("<script language=\"javascript\">alert('Error!!!')</script>");
    res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
    res.end();
  }
  else{
    console.log('GOT INFO');
    const max=result1[0].max_num_people;
    var cur=result1[0].cur_num_people;
      if(cur<max){  //현재 인원이 max 인원보다 작을때 추가
        console.log('ADD!!!');
      connection.query(sql, requirements, (error,results)=>{ //스터디원 추가하기
        if (error){ //에러 메세지
          if(error.code=='ER_DUP_ENTRY'){
            res.write("<script language=\"javascript\">alert('You are already signed up for this study!')</script>");
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
        //  res.write("<script language=\"javascript\">alert('추가되었습니//!')</script>");
          //res.write("<script language=\"javascript\">window.location=\"/study/\"</script>");
        //  res.end();
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
          res.write("<script language=\"javascript\">alert('Added successfully!')</script>");
          res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
        //  res.redirect('/')
        }
      })
    }
    else{   //TODO
      //console.log("OVER MAXIMUM");
        res.write("<script language=\"javascript\">alert('Number of people reached the maximum!')</script>");
        res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
        res.end();
      }
  }
  })
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
      res.redirect('/study');
    }
})
}
});

//스터디 수정하기
router.post('/modify', (req, res, next) => {
  const { session } = req;
  const { study_id } = req.body;
  console.log(study_id);
  console.log("수정 페이지");
  console.log(req.body);
  const sql_study = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE (study_id = ?)`
  const requirements_study = [study_id];
  const sql_user = `SELECT username, email FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE (user_id = ?)`

  connection.query(sql_study, requirements_study, (error, results, fields) => {
    // console.log("about study" + results);
    const study = results[0];
    const requirements_user = [study.user_id];
    if (error) {
      res.write("<script language=\"javascript\">alert('Fail to modify')</script>");
      res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
      res.end();
    } else {

      connection.query(sql_user, requirements_user, (error, results2, fields) => {
        if (error) {
          res.write("<script language=\"javascript\">alert('Fail to modify')</script>");
          res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
        } else {
          // console.log("about user" + results2);
          const writer = results2[0];
          res.render('../views/study/modify', { session , study, writer });
        }
      })
    }
  })


});

//스터디 수정하기 버튼 눌렀을 때
router.post('/update', (req, res, next) => {
  const { session } = req;
  const { study_id } = req.body;
  //console.log("What I want to see")
  //console.log("////////////////////////")
  //console.log(req.body);
  //console.log(study_id);

  var easypath_id = parseInt(req.param("easypath_id")); //지금 front에 easypath관련 등록부분이없어서 1로 상수정함
  var study_title = req.param('title');
  var study_content = req.param('content');
  var max_num_people = parseInt(req.param('person_num')); //'1'이렇게 와서 이걸 정수형으로바꿈

  var study_location = req.param('location');

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

  var sql = `UPDATE REALLY_FINAL_DB.TBL_STUDY_INFO
  SET easypath_id = ${easypath_id}, study_title = '${study_title}', study_content = '${study_content}', max_num_people = ${max_num_people}, study_location = '${study_location}' WHERE (study_id = ${study_id});`;

  connection.query(sql,(error, results1, fields) => {
    if (error) {//에러가뜨면 이쪽을실행함
      Console.log('error is')
      Console.log(error);
      res.write("<script language=\"javascript\">alert('check easypath id again')</script>"); //alert는알림띄우는거
      res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
      res.end();
    } else { //성공하면 이걸실행함 result에 쿼리결과가들어감
      console.log('\nmodify query success');
      console.log(sql);
      res.redirect("./");
      }
    })
  });

//스터디 삭제하기 버튼 눌렀을 때
/* 여기서 해야될 거가 delete 버튼을 누르면 실제로 DB에서 데이터를 삭제하는 거지

  해당 스터디 이름의  study_id가 있는 row 가 전부 삭제 되어야함
  먼저 participation_info table에서 study_info가 있는 row를 모두 삭제하고 (- 서브쿼리에서  study_id를 찾는다)
  study_info table 에서 삭제하자*/

  router.post('/delete', (req, res, next) => {
    const { user_id } = req.session;
    const { study_id } = req.body;
    console.log(study_id); // study_id
    console.log(user_id); // user_id who wants getting out of study.

    const sql_deleteParticipant=`DELETE FROM REALLY_FINAL_DB.TBL_STUDY_PARTICIPANT_INFO WHERE study_id=${study_id};`
    const sql_deleteStudy=`DELETE FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE study_id=${study_id};`

    const requirements=[user_id,study_id];
    const requirement1=[study_id];

  if(study_id&&user_id){
    connection.query(sql_deleteParticipant, requirements,(error,results,fields)=>{
      if (error){
        Console.log('error is'+error);
      }
      else{
        console.log('Delete study participant info successful'+JSON.stringify(results));
        console.log(sql_deleteParticipant);

        connection.query(sql_deleteStudy,requirement1,(error,results2)=>{  //현재인원수 업데이트
          if (error){
            Console.log('error is'+error);
            res.write("<script language=\"javascript\">alert('Error in updating!!!')</script>");
            res.write("<script language=\"javascript\">window.location=\"/study\"</script>");
            res.end();
          }
          else{
            console.log('Delete study info successful'+JSON.stringify(results2));
            console.log(sql_deleteStudy)
          }
        })
        res.redirect('./');
      }
  })
  }
  });




router.get('/show/:id', (req, res, next) => {
  const { session } = req;
  const { id } = req.params;
  console.log(id); // it's study_id
  //console.log("////////////////");
  const sql_study = `SELECT * FROM REALLY_FINAL_DB.TBL_STUDY_INFO WHERE (study_id = ?)`
  const requirements_study = [id];

  const sql_user = `SELECT username, email FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE (user_id = ?)`

  connection.query(sql_study, requirements_study, (error, results, fields) => {
    //console.log("about study" + results);
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
	WHERE study_content LIKE '%${searchWord}%';`
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
