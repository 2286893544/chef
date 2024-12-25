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
  orderFormModel,//票数操作库
} = require("../model/model");

// 查询订单
router.get('/getOrder', async (req, res) => {
  try {
    const order = await orderFormModel.findOne({ orderId: req.query.orderId })
    if (!order) {
      return res.status(404).json({ code: 404, msg: '订单未找到' });
    }
    res.json({
      code: 200,
      msg: '订单查询成功',
      data: order
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单查询失败', error: err.message });
  }
});
module.exports = router;