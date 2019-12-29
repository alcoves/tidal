require('dotenv').config();

const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const responseTime = require('response-time');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(responseTime());

app.use('/', require('./routes/root'));
app.use('/conversions', require('./routes/conversions'));

app.use((req, res, next) => {
  const error = new Error('not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(500).send({
    message: error.message || 'unknown',
    error,
  });
});


module.exports = app
