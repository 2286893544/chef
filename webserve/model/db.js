const mongoose = require("mongoose")
//生产环境
// mongoose.connect("mongodb://admin:secure-password@47.113.204.91:27017/chef?authSource=admin", {
//     maxPoolSize: 10,  // 设置连接池大小
//     serverSelectionTimeoutMS: 30000 , // 超时设置为 30 秒
// }).then(() => {
//     console.log('数据库连接成功')
// }).catch((err) => {
//     console.log("数据库连接失败，原因：", err)
// })
//测试环境
mongoose.connect("mongodb+srv://2286893544:3Azf3TzRKXa9bwHR@cluster0.5pee4jn.mongodb.net/chef", {
    maxPoolSize: 10,  // 设置连接池大小
    serverSelectionTimeoutMS: 30000 , // 超时设置为 30 秒
}).then(() => {
    console.log('数据库连接成功')
}).catch((err) => {
    console.log("数据库连接失败，原因：", err)
})
module.exports = mongoose