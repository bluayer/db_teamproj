const express = require('express');
const router = express.Router();
const connection = require('./db');
const Console = console;

router.get('/changeinfo', (req, res, next) => {
  const { session } = req;
  const sql = `SELECT email FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE (user_id= ?)`
  const requirements = [session.user_id];

  connection.query(sql, requirements, (error, results) => {
    if (error) {
      CConsole.log('error is' + error);
      res.write("<script language=\"javascript\">alert('Error!!!')</script>");
      res.write("<script language=\"javascript\">window.location=\"/user/changeinfo\"</script>");
      res.end();
    } else {
      const email = results[0].email;
      res.render('../views/user/userInfoModify.ejs', { session, email });
    }
  })
  
});

router.post('/changeinfo/email', (req, res, next) => {
  const { email } = req.body;
  const { user_id } = req.session
  const sql = `UPDATE REALLY_FINAL_DB.TBL_USER_INFO SET email = ? WHERE (user_id = ?);`
  const requirements = [email, user_id];

  if(email && user_id) {
    connection.query(sql, requirements, (error, results, fields) => {
      if (error) {
        Console.log('error is' + error);
        res.write("<script language=\"javascript\">alert('Error!!!')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/changeinfo\"</script>");
        res.end();
      } else {
        console.log('Querry success!' + JSON.stringify(results));
        res.redirect('/');
      }
    })
  }
});

router.post('/changeinfo/pw', (req, res, next) => {
  const { cur_password, password} = req.body; // 현재 비밀번호, 새 비번, 확인 비번
  const { user_id } = req.session
  const sql = `UPDATE REALLY_FINAL_DB.TBL_USER_INFO SET password = ? WHERE (user_id = ?) and (password = ?);`
  const requirements = [password, user_id, cur_password];

  if(cur_password && password && user_id) {
    connection.query(sql, requirements, (error, results, fields) => {
      if (error) {
        Console.log('error is' + error);
        res.write("<script language=\"javascript\">alert('Error!!!')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/changeinfo\"</script>");
        res.end();
      } else {
        console.log('Querry success!' + JSON.stringify(results));
        res.redirect('/');
      }
    })
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('sid');

  res.redirect("/");
});

router.get('/login', (req, res, next) => {
  res.render('../views/user/login');
});

router.post('/login', (req, res, next) => {
  const { name, password } = req.body;
  const sql = `SELECT * FROM REALLY_FINAL_DB.TBL_USER_INFO where UserName=? and Password=?;`
  const requirements = [name, password];
  if(name && password) {
    connection.query(sql, requirements, (error, results, fields) => {
      if (error) {
        res.write("<script language=\"javascript\">alert('There's problem in query, try again please')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/login\"</script>");
        res.end();
      } else if(results.length > 0) {
        console.log('Querry success!' + JSON.stringify(results));
        req.session.loggedin = true;
        req.session.username = name;
        req.session.user_id = results[0].user_id;
        res.redirect('/');
      } else {
        res.write("<script language=\"javascript\">alert('Wrong input')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/login\"</script>");
        res.end();
      }
    })
  }
});

router.get('/signup', (req, res, next) => {
  res.render('../views/user/signup');
});

router.post('/signup', async (req, res, next) => {
  const { name, email, password, password2, tel } = req.body;
  const sql = `INSERT INTO REALLY_FINAL_DB.TBL_USER_INFO (username, email, password, phone_num) VALUES (?, ?, ?, ?);`
  const requirements = [name, email, password, tel];

  if(name && email && password && tel) {
    connection.query(sql, requirements, function(error, results, fields) {
      if (error) {
        res.write("<script language=\"javascript\">alert('There's problem in query, try again please')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/signup\"</script>");
        res.end();
      } else if (results.length > 0){
        console.log('Querry success!' + results);
        res.write("<script language=\"javascript\">alert('Make your account successfully')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/login\"</script>");
        res.end();
      } else {
        res.write("<script language=\"javascript\">alert('Wrong input')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/signup\"</script>");
        res.end();
      }
		});
  }
});

router.get('/getout', (req, res, next) => {
  const { user_id } = req.session;
  const requirements = [user_id];
  const sql = `DELETE FROM REALLY_FINAL_DB.TBL_USER_INFO WHERE (user_id = ?);`;

  if(user_id) {
    connection.query(sql, requirements, function(error, results, fields) {
      if (error) {
        res.write("<script language=\"javascript\">alert('There's problem in query, try again please')</script>");
        res.write("<script language=\"javascript\">window.location=\"/user/changeinfo\"</script>");
        res.end();
      } else {
        console.log('Querry success!' + results);
        res.write("<script language=\"javascript\">alert('Bye Bye~')</script>");
        res.write("<script language=\"javascript\">window.location=\"/\"</script>");
        res.end();
      }
    })
  }
}) 

module.exports = router;