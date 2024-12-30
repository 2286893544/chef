const formatDate = (dateString) => {
  const date = new Date(dateString); // 将字符串解析为 Date 对象

  const year = date.getFullYear(); // 获取年份
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份（从0开始），补零
  const day = String(date.getDate()).padStart(2, '0'); // 获取日期，补零

  const hours = String(date.getHours()).padStart(2, '0'); // 获取小时，补零
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟，补零
  const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒数，补零

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 格式化为 YYYY-MM-DD HH:mm:ss
}

module.exports = { formatDate };