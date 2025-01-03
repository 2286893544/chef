// 订单处理文件
const { formatDate } = require("./formatDate")
const schedule = require('node-schedule');
const moment = require('moment-timezone'); // 引入 moment-timezone
const {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
  aftdoorModel,//票数操作库
  orderFormModel,//订单系统
  TaskModel,//任务系统
  ctrlModel,//后台管理账号
  registerModel,// 登录
} = require("../model/model")

async function orderDispose() {
  // 定时任务 - 每五分钟执行一次
  schedule.scheduleJob('*/1 * * * *', async () => {
    // 获取当前时间
    const now = moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
    // 获取当前时间的前五分钟
    const fiveMinutesAgo = formatDate(now)
    // 查询数据库中所有订单状态为未支付且创建时间大于创建时间五分钟的订单，改为失败
  })
}

module.exports = {
  orderDispose
}