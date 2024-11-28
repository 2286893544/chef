const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://2286893544:3Azf3TzRKXa9bwHR@cluster0.5pee4jn.mongodb.net/chef").then(() => {
    console.log('数据库连接成功')
}).catch((err) => {
    console.log("数据库连接失败，原因：", err)
})

module.exports = mongoose