const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoStore = require('connect-mongo')(session);

const app = express();

const databaseInfo = require('./database.json');

const port = process.env.PORT || 3000;

// Set env values.
require('dotenv').config();

const connection = require('./routes/db');

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

app.set('view engine', 'ejs');

// Set for static file
app.use(express.static(`${__dirname}/public`));

// Set bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set session with MongoDB
app.use(session({
  store: new mongoStore({
    url: `mongodb://${databaseInfo.mongo.dbuser}:${databaseInfo.mongo.dbpassword}@ds041228.mlab.com:41228/team_session`,
    collection: "sessions",
    clear_interval: 60 * 30
  }),
  key: 'sid',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 30// 1000ms -> 1s, so 30 min is session live time
  }
}));

// Set routes
app.use('/', require('./routes/home'));
app.use('/study', require('./routes/study'));
app.use('/easypath', require('./routes/easypath'));
app.use('/user', require('./routes/user'));

app.listen(port, function () {
  console.log(`DB app listening on ${port}!`);
});