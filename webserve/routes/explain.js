var express = require('express');
var router = express.Router();
var {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
  aftdoorModel,//票数操作库
} = require("../model/model");

// 活动说明页 - 图片
router.get('/getExplain', async (req, res) => {
  let data;
  let acspeak;
  try {
    data = await activityMsgModel.find();
    acspeak = await acspeakModel.find()
  } catch (err) {
    res.status(500).send({ msg: '服务器错误', code: 500, err })
  } finally {
    res.send({ msg: '查询成功', code: 200, data, acspeak })
  }
})

// 活动信息
router.get('/getActivityMsg', async (req, res) => {
  let data;
  try {
    data = await activityMsgModel.find();
  } catch (err) {
    res.status(500).send({ msg: '服务器错误', code: 500, err })
  }
})


module.exports = router;