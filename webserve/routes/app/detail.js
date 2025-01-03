var express = require('express');
var router = express.Router();
var {
  carouselModel,  //  轮播图
  userInfoModel,//用户
  commentModel,//留言板
} = require("../../model/model");

// 获取轮播图
router.get('/getCarousel', async (req, res) => {
  let carousel;
  let { page = 1, pagesize = 5 } = req.query
  try {
    carousel = await carouselModel.find({ isDelete: true }).skip((page - 1) * pagesize).limit(pagesize)
  } catch (err) {
    res.json({ code: 500, msg: '获取轮播图失败', err })
  } finally {
    res.json({ code: 200, msg: '获取轮播图成功', data: carousel })
  }
})

// 获取选手信息
router.get("/getUserInfo", async (req, res) => {
  try {
    let userRank;  // 排名
    let preVote;   // 距离上一名票数
    let { _id } = req.query

    let user = await userInfoModel.findOne({ _id }).lean()
    let data = await userInfoModel.find().lean().sort({ vote: -1 })
    userRank = data.findIndex(item => item._id == _id) + 1
    if (userRank > 1) {
      preVote = data[userRank - 2].vote - user.vote
    } else {
      preVote = 0
    }

    res.json({ code: 200, msg: "获取选手信息成功", user, userRank, preVote })
  } catch (err) {
    res.status(500).json({ code: 500, msg: "获取选手信息失败", err })
  }
})

// 获取留言信息
router.get("/getComment", async (req, res) => {
  const { cid, page, pageSize } = req.query
  let data;
  let total;
  try {
    data = await commentModel.find({ cid }).skip((page - 1) * pageSize).limit(pageSize);
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

// 添加留言信息
router.post("/addComment", async (req, res) => {
  try {
    let userInfo = await userInfoModel.findOne({ _id: req.body.uid })
    req.body.avtor = userInfo.avtor
    req.body.name = userInfo.name
    await commentModel.create(req.body)
  } catch (err) {
    res.status(500).send({ code: 500, msg: "添加失败", err })
  } finally {
    res.status(200).send({ code: 200, msg: "添加成功" })
  }
})


module.exports = router;