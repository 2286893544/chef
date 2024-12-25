var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');
const homePageRouter = require('./routes/homePage');    // 首页
const applyRouter = require('./routes/apply');          // 报名
const explainRouter = require('./routes/explain');      // 说明
const rankRouter = require('./routes/rank');            // 排名
const detailRouter = require('./routes/detail');        // 详情
const paymentRouter = require('./routes/payment');      // 支付
const orderFormRouter = require('./routes/orderForm');  // 订单系统
const users = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.use('/', indexRouter);
app.use('/homePage', homePageRouter);
app.use('/apply', applyRouter);
app.use('/explain', explainRouter);
app.use('/rank', rankRouter);
app.use('/detail', detailRouter);
app.use('/payment', paymentRouter);
app.use('/orderForm', orderFormRouter);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
