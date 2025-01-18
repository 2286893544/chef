var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
var {
  carouselModel,  //  轮播图
  userInfoModel,//用户
  commentModel,
  positionModel,//留言板
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
    let { _id } = req.query;

    // 获取用户信息
    let user = await userInfoModel.findOne({ $and: [{ _id }, { isApply: true }] }).lean();
    if (!user) {
      return res.status(404).json({ code: 404, msg: "用户未找到" });
    }

    // 获取所有已申请的选手并排序
    let data = await userInfoModel.find({ isApply: true }, { _id: 1, vote: 1 }).lean().sort({ vote: -1, mark: 1 });

    // 计算用户排名
    const uId = new mongoose.Types.ObjectId(_id)
    userRank = (data.findIndex(item => item._id.toString() === uId.toString())) + 1;

    console.log(userRank)

    // 计算与上一名选手的票数差
    if (userRank > 1 && userRank <= data.length) {
      preVote = data[userRank - 2].vote - user.vote;
    } else {
      preVote = 0;
    }
    let pList = await positionModel.find()
    user.positionName = pList.find(item => item._id.toString() === user.position.toString()).jobTitle

    res.json({ code: 200, msg: "获取选手信息成功", user, userRank, preVote });
  } catch (err) {
    console.error(err);  // 记录错误日志
    res.status(500).json({ code: 500, msg: "获取选手信息失败" });
  }
});

// 获取留言信息
router.get("/getComment", async (req, res) => {
  const { cid, page, pageSize } = req.query
  try {
    let data = await commentModel.find({ cid }).skip((page - 1) * pageSize).limit(pageSize);
    let total = await commentModel.find({ cid }).countDocuments()
    res.status(200).send({ code: 200, data, total })
  }
  catch (err) {
    res.status(500).send({
      code: 500,
      msg: "获取失败",
      err
    })
  }
})
//获取留言
router.get("/getappComment", async (req, res) => {
  const { cid, userId } = req.query;  // 假设 userId 会传递过来
  let data;
  let total;

  try {
    // 基础查询条件
    let query = { cid };

    // 查询审核通过的留言，或当前用户自己留言的未审核留言
    query.$or = [
      { isPass: true, audit: true },  // 审核通过且通过审核的留言
      { audit: false, userId }        // 未通过审核且是当前用户的留言
    ];

    // 获取数据
    data = await commentModel.find(query);

    // 获取总记录数
    total = data.length;  // 直接计算返回的数据的长度
  }
  catch (err) {
    res.status(500).send({
      code: 500,
      msg: "获取失败",
      err
    });
  } finally {
    res.status(200).send({
      code: 200,
      data,
      total
    });
  }
});

// 添加留言信息
router.post("/addComment", async (req, res) => {
  try {
    // 校验 req.body 是否包含所需的字段
    if (!uid || !avtor || !name) {
      return res.status(400).send({ code: 400, msg: "缺少必要的字段" });
    }

    let userInfo = await userInfoModel.findOne({ _id: uid });
    if (!userInfo) {
      return res.status(404).send({ code: 404, msg: "用户不存在" });
    }
    req.body.avtor = userInfo.avtor
    req.body.name = userInfo.name
    await commentModel.create(req.body)
    res.status(200).send({ code: 200, msg: "添加成功" })
  } catch (err) {
    res.status(500).send({ code: 500, msg: "添加失败", err })
  }
})


module.exports = router;