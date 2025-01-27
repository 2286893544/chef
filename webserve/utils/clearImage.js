// 引入依赖
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const { writeLog } = require('./logger'); // 导入 logger.js 中的写入日志函数

async function clearImages() {
  // 定时任务 - 每天凌晨12点执行一次
  schedule.scheduleJob('0 0 * * *', async () => {
    try {
      const directories = ['images', 'upload'];
      const allowedExtension = '.webp';

      for (const dir of directories) {
        const dirPath = path.join(__dirname, '../', dir);
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const extname = path.extname(file).toLowerCase();

          // 删除非webp文件
          if (extname !== allowedExtension) {
            fs.unlinkSync(filePath);
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19); // 获取当前时间
            const logMessage = `已删除文件: ${filePath}，执行时间: ${timestamp}`;
            console.log('更新日志', logMessage);
            writeLog('clearImages.txt', logMessage);  // 记录日志
          }
        });
      }
      // 记录成功删除的文件
      const successLogMessage = `清理任务完成，所有非webp文件已删除，执行时间: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`;
      writeLog('clearImages.txt', successLogMessage);  // 记录成功日志
    } catch (err) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19); // 获取当前时间
      const errorMessage = `清理图片失败: ${err.message}，执行时间: ${timestamp}`;
      console.error(errorMessage);
      writeLog('clearImages.txt', errorMessage);  // 记录错误日志·
    }
  });
}

module.exports = {
  clearImages
};
