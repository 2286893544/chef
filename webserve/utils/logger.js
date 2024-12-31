const fs = require('fs');
const path = require('path');

/**
 * 格式化时间
 * @returns {String} 格式化后的时间字符串
 */
function getFormattedTimestamp() {
  const now = new Date();
  // 格式化时间为 "YYYY-MM-DD HH:mm:ss"
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}


/**
 * 写入日志到指定文件
 * @param {String} fileName - 日志文件名
 * @param {String} message - 日志内容
 */
function writeLog(fileName, message) {
  const logFilePath = path.join(__dirname, '../logs', fileName); // 确定日志文件路径
  const timestamp = getFormattedTimestamp(); // 获取格式化后的时间
  const logMessage = `[${timestamp}] ${message}\n`;

  // 创建日志目录（如果不存在）
  if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  }

  // 写入日志
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error(`写入日志到 ${fileName} 失败:`, err);
    } else {
      console.log(`日志已写入到 ${fileName}:`, message);
    }
  });
}

module.exports = { writeLog };
