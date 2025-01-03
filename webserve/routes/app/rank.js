var express = require('express');
var router = express.Router();
var {
  activityMsgModel, //  活动信息
  userInfoModel,//用户
} = require("../../model/model");

// 获取服务器数据展示
router.get("/getShow", async (req, res) => {
  let data;
  try {
    data = activityMsgModel.find();
  } catch (err) {
    res.status(500).send({ msg: "服务器错误", code: 500, ok: false })
  } finally {
    res.status(200).send({ msg: "获取成功", code: 200, ok: true, data })
  }
})

router.get("/getRank", async (req, res) => {
  let userRank; // 前三名
  let userRanks; // 其他名次
  let { page = 1, pagesize = 6, position = '' } = req.query;
  let total;

  try {
    let data;
    let topUsers;
    let filterConditions = { isApply: true }; // 确保只查询 isApply 为 true 的数据

    // 如果有职位，加入职位筛选条件
    if (position) {
      filterConditions.position = position;
    }

    // 获取全局的前三名，确保是 isApply: true 的用户
    topUsers = await userInfoModel.find(filterConditions)
      .sort({ vote: -1, mark: 1 })  // 先按 vote 排序，如果 vote 相同，按 mark 升序排序
      .limit(3)
      .lean();

    // 获取前三名的用户ID
    const topUserIds = topUsers.map(user => user._id);

    // 获取总记录数，排除前三名的数据
    total = await userInfoModel.find({
      ...filterConditions,
      _id: { $nin: topUserIds }
    }).countDocuments();

    // 获取分页后的数据，排除前三名，确保 isApply: true
    data = await userInfoModel.find({
      ...filterConditions,
      _id: { $nin: topUserIds } // 排除前三名
    })
      .sort({ vote: -1, mark: 1 })  // 先按 vote 排序，如果 vote 相同，按 mark 升序排序
      .skip((page - 1) * pagesize)  // 分页跳过已显示的数据
      .limit(pagesize)  // 限制每页的数量
      .lean();

    // 将前三名与分页数据合并，确保没有重复的用户
    userRank = topUsers;
    userRanks = data; // 排除前三名后的分页数据

    res.status(200).send({
      msg: "获取成功",
      code: 200,
      ok: true,
      userRank,
      userRanks,
      total,  // 返回的 total 是所有 isApply: true 的用户总数
    });

  } catch (err) {
    res.status(500).send({ msg: "服务器错误", code: 500, ok: false });
  }
});









// 首页根据用户职位
router.get('/getPosition', async (req, res) => {
  let data;
  let { position = '', page = 1, pagesize = 6 } = req.query
  try {
    data = await userInfoModel.find({ position: position }).skip((page - 1) * pagesize).limit(pagesize)
  } catch (err) {
    res.json({
      code: 500,
      msg: "服务器错误",
      err
    })
  } finally {
    res.json({
      code: 200,
      msg: "成功",
      data
    })
  }
})

module.exports = router;