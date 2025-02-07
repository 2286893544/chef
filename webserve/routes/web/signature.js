const express = require('express');
const router = express.Router();
const { getJsApiTicket, generateSignature } = require('../../utils/jurisdiction');

// 配置微信公众号的 appid 和 secret
const appid = 'wxc84327f9bba81aff';  // 你的公众号appId
const secret = '22314139308c82d14fc443f005443bd8';  // 你的公众号密钥

// 路由：获取签名信息
router.get('/getSignature', async (req, res) => {
  // 获取前端传递的编码 URL 参数
  const encodedUrl = req.query.url || 'https://zcgjcy.com/app/layout/home';

  // 解码 URL
  const url = decodeURIComponent(encodedUrl);

  try {
    // 获取jsapi_ticket
    const ticket = await getJsApiTicket(appid, secret);

    // 生成签名
    const { timestamp, nonceStr, signature } = generateSignature(ticket, url);

    // 返回签名信息
    res.json({
      appId: appid,
      timestamp,
      nonceStr,
      signature,
      url
    });
  } catch (error) {
    console.error('获取签名失败:', error); // 记录错误信息
    res.status(500).send({ error: '获取签名失败', details: error.message }); // 返回更详细的错误信息
  }
});

module.exports = router;
