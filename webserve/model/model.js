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


//活动信息
const activityMsgSchema = new mongoose.Schema({
  title: String,
  joinNum: Number,
  accumulatedNum: Number,
  visitNum: Number,
  startTime: Date,
  endTime: Date,
  rule: String
})
const activityMsgModel = mongoose.model("activityMsg", activityMsgSchema, "activityMsg")

// 职位
const positionSchema = new mongoose.Schema({
  jobTitle: String,
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
  }
})
const positionModel = mongoose.model("position", positionSchema, "position")
//用户
const userInfoSchema = new mongoose.Schema({
  name: String,
  cover: String,
  isApply: {
    type: Boolean,
    default: false
  },
  vote: {
    type: Number,
    default: 0
  },
  mark: {
    type: Number,
    unique: true,
  },
  avtor: String,
  age: Number,
  gender: Boolean,
  label: String,
  jurisdictiom: {
    type: Boolean,
    default: true
  },
  voteNum: {
    type: Number,
    default: 2
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "position"
  },
  resumeText: String,
  visitNum: {
    type: Number,
    default: 0
  },
  richText: String,
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
  }
})
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // 计数器名称
  seq: { type: Number, default: 0 },     // 当前计数器的值
});

// 留言板
const commentSchema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  name: String,
  avtor: String,
  startTime: {
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
  audit: {
    type: Boolean,
    default: false
  },
  content: String,
  cid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
})
const commentModel = mongoose.model("comment", commentSchema, "comment")


const Counter = mongoose.model('Counter', counterSchema);
userInfoSchema.pre('save', async function (next) {
  if (this.isNew) {
    // 获取并更新计数器
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'mark' },          // 计数器名称
      { $inc: { seq: 1 } },     // 自增计数器
      { new: true, upsert: true } // 如果不存在则创建计数器
    );

    // 设置 mark 为新的计数器值
    this.mark = counter.seq;
  }
  next();
});
//投票信息
const voteSchema = new mongoose.Schema({
  dovoter: String,//投票的用户
  actvoter: String,//被投的选手
  votetime: {
    type: Date,
    default: Date.now()
  }
})
const voteModel = mongoose.model("vote", voteSchema, 'vote')
const userInfoModel = mongoose.model("userInfo", userInfoSchema, "userInfo")
//活动说明页
const acspeakSchema = new mongoose.Schema({
  imgsrc: String
})
const acspeakModel = mongoose.model("acspeak", acspeakSchema, 'acspeak')
module.exports = {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
}