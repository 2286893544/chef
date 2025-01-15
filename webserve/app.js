var createError = require('http-errors'); // HTTP 错误处理中间件
var express = require('express'); // 引入 Express 框架
var path = require('path'); // 用于处理文件路径
var cookieParser = require('cookie-parser'); // 用于解析 Cookie
var logger = require('morgan'); // 用于日志记录
var cors = require('cors'); // 解决跨域问题

// 引入路由文件
const indexRouter = require('./routes/web/index'); // 默认首页路由
const paymentRouter = require('./routes/web/payment');      // 支付
const orderFormRouter = require('./routes/web/orderForm');  // 订单系统
const loginRouter = require('./routes/web/login');         // 登录
const uoloadFileRouter = require('./routes/web/uploadFile');   // 上传文件

const homePageRouter = require('./routes/app/homePage');    // 首页
const applyRouter = require('./routes/app/apply');          // 报名
const explainRouter = require('./routes/app/explain');      // 说明
const rankRouter = require('./routes/app/rank');            // 排名
const detailRouter = require('./routes/app/detail');        // 详情

// 初始化 Express 应用
var app = express();

// 引入任务系统的重新加载功能
const { reloadTasks, scheduleDailyVoteReset } = require('./utils/task');
// 引入订单处理函数
const { orderDispose } = require('./utils/orderDispose');
// 引入投票更新中间件
const { updateActivityInfo } = require('./utils/visitNum');

// ** 任务重启时重新加载未完成任务 **
reloadTasks()
  .then(() => {
    console.log("未完成任务加载完成"); // 加载成功
  })
  .catch(err => {
    console.error("任务加载失败:", err); // 加载失败
  });
// ** 调度每日投票数量重置任务 **
scheduleDailyVoteReset();
// ** 调度订单处理任务 **
orderDispose();
// ** 调度每3秒更新活动信息的票数和参赛人数任务 **
updateActivityInfo();

// ** 配置视图引擎 ** 
app.set('views', path.join(__dirname, 'views')); // 设置视图文件路径
app.set('view engine', 'jade'); // 设置模板引擎为 Jade（可根据需要改为其他模板引擎）

// ** 使用中间件 **
app.use(cors()); // 解决跨域问题
app.use(logger('dev')); // 请求日志记录
app.use(express.json()); // 解析 JSON 数据
app.use(express.urlencoded({ extended: false })); // 解析 URL 编码的数据
app.use(cookieParser()); // 解析 Cookie
app.use(express.static(path.join(__dirname, 'public'))); // 设置静态文件路径
app.use('/upload', express.static(path.join(__dirname, 'upload'))); // 文件上传路径
app.use('/img', express.static(path.join(__dirname, 'images'))); // 文件上传路径

// ** 注册路由 **
app.use('/', indexRouter); // 默认首页
app.use('/homePage', homePageRouter); // 首页模块
app.use('/apply', applyRouter); // 报名模块
app.use('/explain', explainRouter); // 说明模块
app.use('/rank', rankRouter); // 排名模块
app.use('/detail', detailRouter); // 详情模块
app.use('/payment', paymentRouter); // 支付模块
app.use('/orderForm', orderFormRouter); // 订单模块
app.use('/login', loginRouter); // 登录模块
app.use('/uploadFile', uoloadFileRouter); // 上传文件模块

// ** 捕获 404 错误，并交由错误处理中间件处理 **
app.use(function (req, res, next) {
  next(createError(404)); // 创建 404 错误
});

// ** 错误处理中间件 **
app.use(function (err, req, res, next) {
  // 设置本地变量，仅在开发环境中提供错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 渲染错误页面
  res.status(err.status || 500); // 默认错误码为 500
  res.render('error');
});

// 导出 app 实例，供其他文件使用
module.exports = app;
