const axios = require('axios');
const md5 = require('md5');

function nowDate() {
  return Math.floor(new Date().valueOf() / 1000).toString();
}

function uuid() {
  return Date.now().toString(16).slice(0, 6) + '-' + Math.random().toString(16).slice(2, 8);
}


function getHash(params, appSecret) {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash') //过滤掉空值和hash本身
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = sortedParams + appSecret;
  return md5(stringSignTemp);
}

async function wxPay(options) {
  //发起支付的函数，直接写在发起支付的接口里面
  const params = {
    version: '1.1',
    appid: '201906169428', //填写虎皮椒的APPID
    trade_order_id: options.order_id, //商户订单号
    total_fee: options.money, //金额，最多两位小数
    title: options.title, // 商品标题
    time: nowDate(),
    notify_url: `${options.backendUrl}`, // 支付通知回调地址
    nonce_str: uuid(), // 随机字符串
    type: 'WAP',
    wap_url: 'http://www.xunhupay.com', // 支付跳转的URL
    wap_name: '支付页面', // 支付页面名称
  };
  const hash = getHash(params, '1ed05cdb3a0ba072cc4d52c4fa3b32f3');


  // 发送支付请求
  const requestParams = new URLSearchParams({
    ...params,
    hash,
  });

  try {
    const response = await axios.post('https://api.xunhupay.com/payment/do.html', requestParams, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // 返回支付接口的响应数据
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    // 抛出错误信息供调用方处理
    throw new Error(error.response ? error.response.data : '支付请求失败');
  }
}
// wxPay({
//   order_id: 1,
//   money: 1,
//   title: 'test',
//   backendUrl: 'http://fyxyw.top',
// });


module.exports = { wxPay, getHash };


// appid: 201906169428
// 密钥: 1ed05cdb3a0ba072cc4d52c4fa3b32f3