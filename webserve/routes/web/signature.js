var express = require('express');
var router = express.Router();
const { getJsApiTicket, generateSignature } = require('../../utils/jurisdiction')

// 配置微信公众号的 appid 和 secret
const appid = 'wxc84327f9bba81aff';  // 你的公众号appId
const secret = '22314139308c82d14fc443f005443bd8';  // 你的公众号密钥

// 路由：获取签名信息
router.get('/getSignature', async (req, res) => {
  const url = req.query.url || 'https://zcgjcy.com/app/layout/home';  // 从请求中获取当前页面的URL

  try {
    // 获取jsapi_ticket
    const ticket = await getJsApiTicket(appid, secret);

    // 生成签名
    const { timestamp, nonceStr, signature } = generateSignature(ticket, url);

    // 返回签名信息
    res.json({
      appId: appid,
      timestamp: timestamp,
      nonceStr: nonceStr,
      signature: signature,
      url: url
    });
  } catch (error) {
    res.status(500).send('获取签名失败');
  }
});

module.exports = router;
