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

// 查询指定订单
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


// 查询指定用户的订单
router.get('/getAllOrder', async (req, res) => {
  try {
    let { page = 1, pageSize = 5, sellerId = '' } = req.query
    const orders = await orderFormModel.find({ sellerId }).skip((page - 1) * pageSize).limit(pageSize)
    const total = await orderFormModel.countDocuments({ sellerId: req.query.sellerId })
    res.json({ code: 200, msg: '订单查询成功', data: orders, total })
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单查询失败', error: err });
  }
})

// 删除订单
router.delete('/deleteOrder/:_id', async (req, res) => {
  try {
    let { _id } = req.params

    await orderFormModel.deleteOne({ _id })
    res.status(200).json({ code: 200, msg: '订单删除成功' })
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单删除失败', error: err });
  }
})

// 查询订单
router.get("/getOrderInfo", async (req, res) => {
  try {
    let { orderId = '', money = '', buyerName = '', sellerName = '', status = '', page = 1, pageSize = 5 } = req.query
    let result = []
    let data;
    let total;
    if (orderId) {
      result.push({ orderId })
    }
    if (money) {
      result.push({ money })
    }
    if (buyerName) {
      result.push({ buyerName })
    }
    if (sellerName) {
      result.push({ sellerName })
    }
    if (status) {
      result.push({ status })
    }
    if (result.length > 0) {
      data = await orderFormModel.find({ $and: result }).skip((page - 1) * pageSize).limit(pageSize)
      total = await orderFormModel.countDocuments({ $and: result })
    } else {
      data = await orderFormModel.find().skip((page - 1) * pageSize).limit(pageSize)
      total = await orderFormModel.countDocuments()
    }
    res.status(200).json({ code: 200, msg: '订单查询成功', data, total })
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单查询失败', error: err });
  }
})

module.exports = router;