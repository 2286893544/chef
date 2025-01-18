const mongoose = require("mongoose")
mongoose.connect("mongodb://admin:secure-password@47.113.204.91:27017/chef?authSource=admin", {
    maxPoolSize: 10,  // 设置连接池大小
    serverSelectionTimeoutMS: 30000  // 超时设置为 30 秒
}).then(() => {
    console.log('数据库连接成功')
}).catch((err) => {
    console.log("数据库连接失败，原因：", err)
})

module.exports = mongoose