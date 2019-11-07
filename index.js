const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

// Set env values.
require('dotenv').config();

app.set('view engine', 'ejs');

// Set for static file
app.use(express.static(`${__dirname}/public`));

// Set bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set routes
app.use('/', require('./routes/home'));
app.use('/post', require('./routes/post'));
app.use('/footprint', require('./routes/footprint'));
app.use('/user', require('./routes/user'));

app.listen(port, function () {
  console.log(`DB app listening on ${port}!`);
});