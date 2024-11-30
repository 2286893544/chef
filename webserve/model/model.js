const mongoose = require('./db')

// 轮播图
const carouselSchema = new mongoose.Schema({
  imgPath: {
    type: String,
    // required: true
  },
  // 添加时间
  addTime: {
    type: Date,
    default: Date.now,
    get: function (value) {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  },
  // 是否删除
  isDelete: {
    type: Boolean,
    default: false
  }
})
const carouselModel = mongoose.model('carousel', carouselSchema, 'carousel')

module.exports = {
  carouselModel
}