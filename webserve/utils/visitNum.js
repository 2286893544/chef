const { activityMsgModel, userInfoModel } = require("../model/model");

/**
 * 定时任务：每3秒更新活动信息的票数和参赛人数
 */
async function updateActivityInfo() {
  // 使用 setInterval 来每 3 秒执行一次任务
  setInterval(async () => {

    // 使用一个查询获取报名的用户数量和投票数
    const users = await userInfoModel.find({ isApply: true });

    // 获取报名的用户数量
    let peopleNum = users.length;

    // 获取所有用户的投票数总和
    let voteNum = users.reduce((sum, user) => sum + user.vote, 0);

    // 更新活动信息
    await activityMsgModel.updateOne({ isStart: true }, { $set: { joinNum: peopleNum, accumulatedNum: voteNum } });
  }, 3000); // 每 3 秒执行一次
}


module.exports = {
  updateActivityInfo
};
