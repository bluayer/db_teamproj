const express = require('express');
const router = express.Router();
const Console = console;

router.get('/', (req, res, next) => {
  const { session } = req;
  if (session.loggedin) {
    Console.log('Login : ' + JSON.stringify(session));
    res.render('../views/index', { session });
  } else {
    Console.log('No login : ' + JSON.stringify(session));
    res.render('../views/index', { session });
  }
});

module.exports = router;