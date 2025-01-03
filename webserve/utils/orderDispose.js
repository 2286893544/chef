// 引入依赖
const schedule = require('node-schedule');
const moment = require('moment-timezone'); // 引入 moment-timezone
const { writeLog } = require('./logger'); // 导入 logger.js 中的写入日志函数
const { orderFormModel } = require("../model/model");

let lastLogStatus = ""; // 用于记录上次写入日志的状态

async function orderDispose() {
  // 定时任务 - 每一分钟执行一次
  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      // 获取当前时间的前五分钟
      const fiveMinutesAgo = moment().tz('Asia/Shanghai').subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      // 查询数据库中所有订单状态为未支付且创建时间大于等于五分钟前的订单
      const ordersToUpdate = await orderFormModel.find({
        status: 'pending', // 未支付订单
        created_at: { $lte: fiveMinutesAgo }, // 创建时间大于等于五分钟前
      });

      // 如果有符合条件的订单，更新状态为失败
      if (ordersToUpdate.length > 0) {
        await orderFormModel.updateMany(
          { _id: { $in: ordersToUpdate.map(order => order._id) } },
          { $set: { status: 'failed' } }
        );
        const logMessage = `已更新 ${ordersToUpdate.length} 个未支付订单为失败状态`;

        // 检查上次记录的日志状态是否相同，如果不同才写入日志
        if (lastLogStatus !== logMessage) {
          console.log('更新日志', logMessage);
          writeLog('orderForm.txt', logMessage);  // 记录日志
          lastLogStatus = logMessage;  // 更新上次记录的日志状态
        }
      } else {
        const logMessage = "没有符合条件的未支付订单";

        // 检查上次记录的日志状态是否相同，如果不同才写入日志
        if (lastLogStatus !== logMessage) {
          console.log('更新日志', logMessage);
          writeLog('orderForm.txt', logMessage);  // 记录日志
          lastLogStatus = logMessage;  // 更新上次记录的日志状态
        }
      }
    } catch (err) {
      const errorMessage = `处理订单失败: ${err.message}`;
      console.error(errorMessage);
      writeLog('orderForm.txt', errorMessage);  // 记录错误日志
    }
  });
}

module.exports = {
  orderDispose
};
