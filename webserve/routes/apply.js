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

// 获取职位信息
router.get("/getPosition", async (req, res) => {
  try {
    let position = await positionModel.find();
    res.json({ code: 200, data: position })
  } catch (err) {
    res.json({ code: 500, msg: "服务器错误" })
  }
})

// 报名  -- 测试中
router.post("/apply", async (req, res) => {
  try {
    let { name, phone, position, id } = req.body;
    let user = await userInfoModel.findOne({ phone });
    if (user) {
      res.json({ code: 500, msg: "该手机号已报名" })
    } else {
      await userInfoModel.create({ name, phone, position, id });
      res.json({ code: 200, msg: "报名成功" })
    }
  } catch (err) {
    res.json({ code: 500, msg: "服务器错误" })
  }
})

module.exports = router;