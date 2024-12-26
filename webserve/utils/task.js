const schedule = require('node-schedule');
const { userInfoModel, TaskModel } = require('../model/model'); // 引入数据库模型
const { formatDate } = require('../utils/formatDate')

let tasks = {}; // 存储当前运行的任务，用于管理任务状态

/**
 * 调度任务
 * @param {String} taskId - 任务 ID（数据库任务的唯一标识）
 * @param {Date} executeAt - 任务执行时间
 * @param {Function} callback - 回调函数，定义任务触发时的逻辑
 */
function scheduleTask(taskId, executeAt, callback) {
  if (tasks[taskId]) {
    console.log(`任务 ${taskId} 已存在，跳过重复调度`);
    return;
  }

  // 如果任务时间已过期，立即执行任务
  const now = new Date();
  if (executeAt < now) {
    console.log(`任务 ${taskId} 的时间 ${executeAt} 已过期，立即执行任务逻辑`);
    callback().then(() => {
      console.log(`任务 ${taskId} 已立即执行完成`);
      updateTaskStatus(taskId, 'completed'); // 更新任务状态为已完成
    }).catch((err) => {
      console.error(`任务 ${taskId} 执行失败:`, err);
    });
    return;
  }

  // 调度任务
  const job = schedule.scheduleJob(executeAt, async () => {
    console.log(`触发任务 ${taskId}`);
    try {
      await callback(); // 执行任务逻辑
      await updateTaskStatus(taskId, 'completed'); // 更新任务状态为已完成
      delete tasks[taskId]; // 任务完成后移除
    } catch (err) {
      console.error(`任务 ${taskId} 执行失败:`, err);
    }
  });

  tasks[taskId] = job; // 将任务存储到全局任务列表
  console.log(`任务 ${taskId} 已调度，将在 ${formatDate(executeAt)} 执行`);
}

/**
 * 更新任务状态
 * @param {String} taskId - 任务 ID
 * @param {String} status - 任务状态（pending/completed）
 */
async function updateTaskStatus(taskId, status) {
  try {
    await TaskModel.updateOne({ _id: taskId }, { status });
    console.log(`任务 ${taskId} 状态更新为 ${status}`);
  } catch (err) {
    console.error(`更新任务 ${taskId} 状态失败:`, err);
  }
}

/**
 * 重新加载未完成的任务
 */
async function reloadTasks() {
  console.log("重新加载未完成任务...");
  const pendingTasks = await TaskModel.find({ status: 'pending' });

  pendingTasks.forEach((task) => {
    scheduleTask(task._id.toString(), task.executeAt, async () => {
      // 任务逻辑：更新用户票数
      await userInfoModel.updateOne(
        { _id: task.userId },
        { $inc: { vote: task.voteIncrement } }
      );
      console.log(`用户 ${task.userId} 的票数增加了 ${task.voteIncrement}`);
    });
  });

  console.log(`重新加载了 ${pendingTasks.length} 个未完成的任务`);
}

module.exports = { scheduleTask, reloadTasks };