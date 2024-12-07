var express = require('express');
var router = express.Router();
var {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  commentModel,//留言板
} = require("../model/model");

// 排名
router.get('/getRank', async (req, res) => {
  let data
  let { position = '', page = 1, pagesize = 5 } = req.query
  try {
    if (position !== '') {
      data = await userInfoModel.find({ position: position }).sort({ score: -1 }).skip((page - 1) * pagesize).limit(pagesize)
    } else {
      data = await userInfoModel.find().sort({ score: -1 }).skip((page - 1) * pagesize).limit(pagesize)
    }
  } catch (err) {
    res.json({
      code: 500,
      msg: "服务器错误"
    })
  } finally {
    res.json({
      code: 200,
      msg: "成功",
      data
    })
  }
})

// 搜索
router.get('/getSearch', async (req, res) => {
  let data;
  let { name = '', page = 1, pagesize = 5 } = req.query
  try {
    data = await userInfoModel.find({ $or: [{ name: name }, { mark: name }] }).skip((page - 1) * pagesize).limit(pagesize)
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

// 最热和排行
router.get('/getHot', async (req, res) => {
  let data;
  let { page = 1, pagesize = 6 } = req.query
  try {
    data = await userInfoModel.find().sort({ score: -1 }).skip((page - 1) * pagesize).limit(pagesize)
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
// 根据addTime最新排行
router.get('/getNew', async (req, res) => {
  let data;
  let { page = 1, pagesize = 6 } = req.query
  try {
    data = await userInfoModel.find().sort({ addTime: -1 }).skip((page - 1) * pagesize).limit(pagesize)
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

// 用户信息
router.get('/getUserInfo', async (req, res) => {
  let data;
  let { page = 1, pagesize = 6 } = req.query
  try {
    data = await userInfoModel.find().skip((page - 1) * pagesize).limit(pagesize)
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

// 活动接口
router.get('/getActivityMsg', async (req, res) => {
  let data;
  try {
    data = await activityMsgModel.find()
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

// 获取用户留言板信息
router.get("/getComment", async (req, res) => {
  const { cid, page, pagesize } = req.query
  let data;
  let total;
  try {
    data = await commentModel.find({ cid }).skip((page - 1) * pagesize).limit(pagesize);
    total = await commentModel.find({ cid }).countDocuments()
  }
  catch (err) {
    res.status(500).send({
      code: 500,
      msg: "获取失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      data,
      total
    })
  }
})


module.exports = router;