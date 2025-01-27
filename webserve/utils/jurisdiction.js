// signature.js
const axios = require('axios');
const crypto = require('crypto');

// 获取 jsapi_ticket
const getJsApiTicket = async (appid, secret) => {
  const accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;

  try {
    const response = await axios.get(accessTokenUrl);
    const accessToken = response.data.access_token;

    // 获取 jsapi_ticket
    const ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const ticketResponse = await axios.get(ticketUrl);
    return ticketResponse.data.ticket;
  } catch (error) {
    console.error('获取jsapi_ticket失败', error);
    throw new Error('获取jsapi_ticket失败');
  }
};

// 生成签名
const generateSignature = (ticket, url) => {
  const timestamp = Math.floor(Date.now() / 1000);  // 当前时间戳（秒）
  const nonceStr = Math.random().toString(36).substring(2, 15);  // 随机字符串

  // 拼接字符串
  const stringToSign = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;

  // 使用 SHA1 进行加密
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  return { timestamp, nonceStr, signature };
};

// 导出函数
module.exports = {
  getJsApiTicket,
  generateSignature
};
