const schedule = require('node-schedule');
const moment = require('moment-timezone'); // 引入 moment-timezone
const { userInfoModel, TaskModel } = require('../model/model'); // 引入数据库模型
const { formatDate } = require('../utils/formatDate');
const { writeLog } = require("./logger")

let tasks = {}; // 存储当前运行的任务，用于管理任务状态

/**
 * 调度任务
 * @param {String} taskId - 任务 ID（数据库任务的唯一标识）
 * @param {Date} executeAt - 任务执行时间
 * @param {Function} callback - 回调函数，定义任务触发时的逻辑
 */

async function scheduleTask(taskId, executeAt, callback) {
  // 检查任务是否已经存在
  if (tasks[taskId]) {
    console.log('----- 调度任务日志 -----')
    console.log(`任务 ${taskId} 已存在，跳过重复调度`);
    return;
  }

  // 检查任务是否已经完成
  const existingTask = await TaskModel.findOne({ _id: taskId });
  if (existingTask && existingTask.status === 'completed') {
    console.log('----- 调度任务日志 -----')
    console.log(`任务 ${taskId} 已经完成，跳过调度`);
    return;
  }

  // 过期任务立即执行
  const now = new Date();
  if (executeAt < now) {
    console.log('----- 调度任务日志 -----')
    console.log(`任务 ${taskId} 的时间 ${executeAt} 已过期，立即执行任务逻辑`);
    await callback(); // 直接执行回调
    console.log(`任务 ${taskId} 已立即执行完成`);
    writeLog('vote.txt', `任务 ${taskId} 已过期，立即执行完成`);
    await updateTaskStatus(taskId, 'completed'); // 更新任务状态
    return;
  }

  // 设置任务执行时间
  const job = schedule.scheduleJob(executeAt, async () => {
    console.log('----- 调度任务日志 -----')
    console.log(`触发任务 ${taskId}`);
    try {
      await callback();
      await updateTaskStatus(taskId, 'completed');
      writeLog('vote.txt', `任务 ${taskId} 已按时触发并执行完成`);
      delete tasks[taskId];
    } catch (err) {
      console.error(`任务 ${taskId} 执行失败:`, err);
      writeLog('vote.txt', `任务 ${taskId} 执行失败: ${err.message}`);
    }
  });

  tasks[taskId] = job;
  console.log('----- 调度任务日志 -----')
  console.log(`任务 ${taskId} 已调度，将在 ${formatDate(executeAt)} 执行`);
}

/**
 * 更新任务状态
 * @param {String} taskId - 任务 ID
 * @param {String} status - 任务状态（pending/completed）
 */
async function updateTaskStatus(taskId, status) {
  try {
    const result = await TaskModel.updateOne({ _id: taskId }, { status });
    if (result.nModified === 0) {
      console.log('----- 调度任务日志 -----')
      console.error(`任务 ${taskId} 状态更新失败: 找不到对应任务`);
    } else {
      console.log('----- 调度任务日志 -----')
      console.log(`任务 ${taskId} 状态更新为 ${status}`);
    }
  } catch (err) {
    console.log('----- 调度任务日志 -----')
    console.error(`更新任务 ${taskId} 状态失败:`, err);
  }
}

/**
 * 重新加载未完成的任务
 */
async function reloadTasks() {
  console.log('----- 调度任务日志 -----')
  console.log("重新加载未完成任务...");
  const pendingTasks = await TaskModel.find({ status: 'pending' });
  console.log(`共找到 ${pendingTasks.length} 个未完成的任务`);

  // 使用 for...of 循环来处理每个任务，确保异步任务按顺序执行
  for (const task of pendingTasks) {
    scheduleTask(task._id.toString(), task.executeAt, async () => {
      try {
        // 确保票数增量是有效的数字
        const voteIncrement = Number(task.voteIncrement);
        if (isNaN(voteIncrement)) {
          console.error(`无效的票数增量: ${task.voteIncrement}`);
          writeLog('vote.txt', `无效的票数增量: ${task.voteIncrement}`);
          // return;
        }

        // 打印调度任务的信息
        console.log(`开始处理任务: ${task._id}, 用户: ${task.userId}, 票数增量: ${voteIncrement}`);

        // 更新用户的票数
        const result = await userInfoModel.updateOne(
          { _id: task.userId },
          { $inc: { vote: voteIncrement } }
        );
        console.log(`更新结果: ${result}`);

        // 如果没有任何记录被修改，打印警告
        if (result.nModified === 0) {
          writeLog('vote.txt', `用户 ${task.userId} 的票数没有被修改`)
        }
        
        // 获取更新后的用户信息
        const updatedUser = await userInfoModel.findById(task.userId);
        writeLog('vote.txt', `更新后的用户票数: ${updatedUser.vote}`)

        // 记录日志信息
        const logMessage = `用户 ${task.userId} 的票数增加了 ${voteIncrement}`;
        console.log('----- 调度任务日志 -----');
        console.log(logMessage);
        writeLog('vote.txt', logMessage);

      } catch (error) {
        // 捕获并打印错误信息
        console.error(`任务处理失败: ${error.message}`);
      }
    });
  }

  const reloadMessage = `重新加载了 ${pendingTasks.length} 个未完成的任务`;
  console.log('----- 调度任务日志 -----')
  console.log(reloadMessage);
  writeLog('vote.txt', reloadMessage);
}

/**
 * 定时任务：每天凌晨 12 点更新用户投票数量（考虑时区）
 */
function scheduleDailyVoteReset() {
  // 获取当前时间，使用 Asia/Shanghai 时区（即北京时区）
  const now = moment().tz('Asia/Shanghai');

  // 设置每天凌晨12点的任务（当前时间后的第二天）
  const scheduleTime = now.clone().endOf('day').add(1, 'minute');  // 获取第二天的 00:01

  schedule.scheduleJob(scheduleTime, async () => {
    console.log('----- 调度任务日志 -----')
    console.log('开始执行每日投票数量重置任务...');
    writeLog('renewal.txt', '开始执行每日投票数量重置任务...');

    try {
      const voteIncrement = 10;
      const result = await userInfoModel.updateMany({}, { $inc: { voteNum: voteIncrement } });
      const successMessage = `成功为 ${result.modifiedCount} 个用户恢复了 ${voteIncrement} 张投票次数`;
      console.log('----- 调度任务日志 -----')
      console.log(successMessage);
      writeLog('renewal.txt', successMessage);
    } catch (err) {
      const errorMessage = `每日投票数量重置任务失败: ${err.message}`;
      console.log('----- 调度任务日志 -----')
      console.error(errorMessage);
      writeLog('renewal.txt', errorMessage);
    }
  });

  console.log('----- 调度任务日志 -----')
  console.log('已成功调度每日凌晨 12 点的投票数量重置任务');
  writeLog('renewal.txt', '已成功调度每日凌晨 12 点的投票数量重置任务');
}

module.exports = {
  scheduleTask, // 设置任务执行时间
  reloadTasks, // 重新加载未完成的任务
  scheduleDailyVoteReset // 定时任务：每天凌晨 12 点更新用户投票数量（考虑时区）
};