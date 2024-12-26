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
  aftdoorModel,
  orderFormModel,//票数操作库
} = require("../model/model");
const { wxPay, getHash } = require('../utils/jsSDK');  // 引入jsSDK中的wxPay方法

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// 支付接口暂定
router.post("/pay", async (req, res) => {
  try {
    const { order_id, total_fee, title, backendUrl, buyerId, sellerId } = req.body;

    // 发起支付请求
    const paymentParams = {
      order_id, //商户订单号
      money: total_fee, //金额，最多两位小数
      title,  // 支付商品的标题
      backendUrl  // 支付通知回调地址
    };

    // 调用支付函数，返回支付平台的响应数据
    let paymentResponse = await wxPay(paymentParams);

    const buyer = await userInfoModel.findOne({ _id: buyerId }).lean();
    const buyerName = buyer.name;
    const seller = await userInfoModel.findOne({ _id: sellerId }).lean();
    const sellerName = seller.name;

    const orderFormInfo = await orderFormModel.findOne({ orderId: order_id });
    
    if (!orderFormInfo) {
      // 添加订单信息
      const orderForm = {
        orderId: order_id, // 订单ID
        money: total_fee, // 订单金额
        title: title, // 订单标题
        buyerId: buyerId, // 买家ID
        sellerId: sellerId, // 卖家ID
        buyerName: buyerName, // 买家姓名
        sellerName: sellerName, // 卖家姓名
      }
      await orderFormModel.create(orderForm)
    }

    // 返回支付接口的响应数据给前端
    res.json({ paymentResponse });
  } catch (err) {
    res.json({ code: 500, msg: "支付请求失败", error: err.message });
  }
})

// 支付回调通知的接口
router.post('/wxnotify', async (req, res) => {
  try {
    const data = req.body || {};
    const appSecret = '1ed05cdb3a0ba072cc4d52c4fa3b32f3';

    // 检验订单是否存在
    const order = await orderFormModel.findOne({ orderId: data.trade_order_id });
    if (!order) {
      console.error("订单不存在:", data.trade_order_id);
      return res.status(404).json({ code: 404, msg: "订单不存在" });
    }

    // 检验订单是否已支付
    if (order.status === 'paid') {
      console.log("订单已支付，忽略重复回调:", data.trade_order_id);
      return res.json({ code: 200, msg: "订单已处理" });
    }

    // 验签逻辑，确保数据未被篡改
    if (data.hash !== getHash(data, appSecret)) {
      await orderFormModel.updateOne({ orderId: data.trade_order_id }, { $set: { status: 'failed', paymentInfo: data, updated_at: new Date() } });
      res.json({ code: 500, msg: '验签失败', data });
      return;
    }

    // 更新订单状态
    const newStatus = data.status === 'OD' ? 'paid' : 'failed';
    await orderFormModel.updateOne({ orderId: data.trade_order_id }, { $set: { status: newStatus, paymentInfo: data, updated_at: new Date() } });

  } catch (e) {
    console.error("支付回调处理失败:", e);
    res.json({ code: 500, msg: "支付回调处理失败", error: e });
  }
});


module.exports = router;