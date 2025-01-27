const express = require('express');
const router = express.Router();
const { userInfoModel, orderFormModel, TaskModel } = require('../../model/model');
const { wxPay, getHash } = require('../../utils/jsSDK');
const { scheduleTask } = require('../../utils/task');

/**
 * 支付接口
 */
router.post('/pay', async (req, res) => {
  try {
    const { order_id, total_fee, title, backendUrl, buyerId, sellerId } = req.body;

    // 检查必要参数
    if (!order_id) {
      return res.status(400).json({ code: 400, msg: '缺少订单号' });
    }
    if (!total_fee) {
      return res.status(400).json({ code: 400, msg: '缺少金额' });
    }
    if (!title) {
      return res.status(400).json({ code: 400, msg: '缺少标题' });
    }
    if (!backendUrl) {
      return res.status(400).json({ code: 400, msg: '缺少后台回调地址' });
    }
    if (!buyerId) {
      return res.status(400).json({ code: 400, msg: '缺少买家ID' });
    }
    if (!sellerId) {
      return res.status(400).json({ code: 400, msg: '缺少卖家ID' });
    }

    // 调用支付接口
    const paymentParams = {
      order_id,
      money: total_fee,
      title,
      backendUrl,
    };
    const paymentResponse = await wxPay(paymentParams);

    // 获取买家和卖家信息
    const buyer = await userInfoModel.findOne({ _id: buyerId }).lean();
    const seller = await userInfoModel.findOne({ _id: sellerId }).lean();
    if (!buyer || !seller) {
      return res.status(404).json({ code: 404, msg: '买家或卖家信息不存在' });
    }

    // 检查订单是否已存在
    const existingOrder = await orderFormModel.findOne({ orderId: order_id });
    if (!existingOrder) {
      // 创建新订单
      await orderFormModel.create({
        orderId: order_id,
        money: total_fee,
        title,
        buyerId,
        sellerId,
        buyerName: buyer.name,
        sellerName: seller.name,
        status: 'pending',
      });
    }

    res.json({ code: 200, msg: '支付请求已发起，请完成支付', data: paymentResponse });
  } catch (err) {
    console.error('支付接口处理失败:', err);
    res.status(500).json({ code: 500, msg: '支付接口处理失败', error: err.message });
  }
});

/**
 * 支付回调接口
 */
router.post('/wxnotify', async (req, res) => {
  try {
    const data = req.body || {};
    const appSecret = '1ed05cdb3a0ba072cc4d52c4fa3b32f3'; // 支付平台签名密钥

    console.log('支付回调数据:', JSON.stringify(data, null, 2));

    // 验证订单是否存在
    const order = await orderFormModel.findOne({ orderId: data.trade_order_id });
    if (!order) {
      console.error('订单不存在:', data.trade_order_id);
      return res.status(404).json({ code: 404, msg: '订单不存在' });
    }

    // 检查订单是否已处理
    if (order.status === 'paid') {
      console.log('订单已支付，忽略重复回调:', data.trade_order_id);
      return res.json({ code: 200, msg: '订单已处理' });
    }

    // 验签逻辑
    const generatedHash = getHash(data, appSecret);
    console.log('生成的 Hash:', generatedHash);
    console.log('回调中的 Hash:', data.hash);
    if (data.hash !== generatedHash) {
      console.error('验签失败:', data);
      await orderFormModel.updateOne(
        { orderId: data.trade_order_id },
        { $set: { status: 'failed', paymentInfo: data, updatedAt: new Date() } }
      );
      return res.status(400).json({ code: 400, msg: '验签失败', data });
    }

    // 如果支付成功
    if (data.status === 'OD') {
      console.log('支付成功:', data.trade_order_id);

      // 更新订单状态
      await orderFormModel.updateOne(
        { orderId: data.trade_order_id },
        { $set: { status: 'paid', paymentInfo: data, updatedAt: new Date() } }
      );

      // 添加任务到任务系统
      const voteIncrement = Math.floor(50); // 1 元等于 1 票
      // const executeAt = new Date(Date.now() + 60 * 60 * 1000); // 一小时后
      const executeAt = new Date(Date.now() + 2 * 60 * 1000); // 两分钟后

      const task = await TaskModel.create({
        userId: order.sellerId,
        voteIncrement,
        executeAt,
        status: 'pending',
      });

      console.log('任务已创建:', task);

      // 调度任务
      scheduleTask(task._id.toString(), executeAt, async () => {
        console.log(`任务开始执行：任务 ID ${task._id}`);
        await userInfoModel.updateOne(
          { _id: task.userId },
          { $inc: { vote: voteIncrement } } // 使用 $inc 累加票数
        );
        console.log(`任务完成：用户 ${task.userId} 的票数增加了 ${voteIncrement}`);

        // 更新任务状态为已完成
        await TaskModel.updateOne(
          { _id: task._id },
          { $set: { status: 'completed', updatedAt: new Date() } }
        );
      });

      res.json({ code: 200, msg: '支付成功，任务已调度', data });
    } else {
      console.log('支付失败:', data.trade_order_id);
      await orderFormModel.updateOne(
        { orderId: data.trade_order_id },
        { $set: { status: 'failed', paymentInfo: data, updatedAt: new Date() } }
      );
      res.status(400).json({ code: 400, msg: '支付失败', data });
    }
  } catch (err) {
    console.error('支付回调处理失败:', err);
    res.status(500).json({ code: 500, msg: '支付回调处理失败', error: err.message });
  }
});


module.exports = router;