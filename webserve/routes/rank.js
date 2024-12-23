var express = require('express');
var router = express.Router();
var {
  activityMsgModel, //  活动信息
  userInfoModel,//用户
} = require("../model/model");

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

// 获取用户数据
router.get("/getRank", async (req, res) => {
  let userRank; // 前三名
  let userRanks;
  let { page = 1, pagesize = 8, position = '' } = req.query;
  let total;
  try {
    let data;
    if (position) {
      data = await userInfoModel.find({ position }).sort({ vote: -1 }).skip((page - 1) * pagesize).limit(pagesize).lean()
      total = await userInfoModel.find({ position }).countDocuments()
    } else {
      data = await userInfoModel.find().sort({ vote: -1 }).skip((page - 1) * pagesize).limit(pagesize).lean()
      total = await userInfoModel.countDocuments()
    }
    userRank = data.filter((item, index) => index < 3)
    userRanks = data.filter((item, index) => index >= 3)
  } catch (err) {
    res.status(500).send({ msg: "服务器错误", code: 500, ok: false })
  } finally {
    res.status(200).send({ msg: "获取成功", code: 200, ok: true, userRank, userRanks, total })
  }
})

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