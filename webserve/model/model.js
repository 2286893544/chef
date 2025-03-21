// const mongoose = require('./db')

// // 轮播图
// const carouselSchema = new mongoose.Schema({
//   imgPath: {
//     type: String,
//     // required: true
//   },
//   // 添加时间
//   addTime: {
//     type: Date,
//     default: Date.now,
//     get: function (value) {
//       const date = new Date(value);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       const seconds = String(date.getSeconds()).padStart(2, '0');
//       return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     }
//   },
//   // 是否删除
//   isDelete: {
//     type: Boolean,
//     default: false
//   }
// })
// const carouselModel = mongoose.model('carousel', carouselSchema, 'carousel')

// // 登陆
// const registerSchema = new mongoose.Schema({
//   name: String,
//   password: String,
//   phone: String
// })
// const registerModel = mongoose.model("register", registerSchema, "register")

// //活动信息
// const activityMsgSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     default: ""
//   },
//   joinNum: {
//     type: Number,
//     default: 0
//   },
//   accumulatedNum: {
//     type: Number,
//     default: 0
//   },
//   visitNum: {
//     type: Number,
//     default: 0
//   },
//   startTime: {
//     type: Date,
//     default: Date.now
//   },
//   endTime: {
//     type: Date,
//     default: Date.now
//   },
//   rule: {
//     type: String,
//     default: ""
//   },
//   announcement: {
//     type: String,
//     default: ""
//   },
//   isStart: {
//     type: Boolean,
//     default: false
//   }
// })
// const activityMsgModel = mongoose.model("activityMsg", activityMsgSchema, "activityMsg")

// // 职位
// const positionSchema = new mongoose.Schema({
//   jobTitle: String,
//   addTime: {
//     type: Date,
//     default: Date.now,
//     get: function (value) {
//       const date = new Date(value);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       const seconds = String(date.getSeconds()).padStart(2, '0');
//       return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     }
//   }
// })
// const positionModel = mongoose.model("position", positionSchema, "position")
// //用户
// const userInfoSchema = new mongoose.Schema({
//   name: String,//姓名必填
//   isApply: {//是否参赛默认就OK
//     type: Boolean,
//     default: false
//   },
//   vote: {//票数可以不要
//     type: Number,
//     default: 0
//   },
//   mark: {//不用添加
//     type: Number,
//     unique: true,
//   },
//   avtor: {
//     type: String,
//     default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAJX82J0tJmJfIyI0utQZIP1S9hG6zYI_3ZA&s"
//   },//头像
//   voteNum: {//投票的剩余票数,可以不添加
//     type: Number,
//     default: 2
//   },
//   position: {//职位必填
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "position"
//   },
//   visitNum: {//访问量默认，后期进行修改
//     type: Number,
//     default: 0
//   },
//   addTime: {//默认添加
//     type: Date,
//     default: Date.now,
//     get: function (value) {
//       const date = new Date(value);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       const seconds = String(date.getSeconds()).padStart(2, '0');
//       return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     }
//   },
//   gitflower: {
//     type: Number,
//     default: 0
//   },
//   isAudit: { // 简历审核是否通过
//     type: Boolean,
//     default: false
//   },
//   // deviceid: String,//设备指纹游客唯一id
//   introduce: String,//简介
//   // openid: String,//微信openid
//   phone: String,
//   pwd: String
// })
// const counterSchema = new mongoose.Schema({
//   _id: { type: String, required: true }, // 计数器名称
//   seq: { type: Number, default: 0 },     // 当前计数器的值
// });

// const Counter = mongoose.model('Counter', counterSchema);
// userInfoSchema.pre('save', async function (next) {
//   if (this.isNew) {
//     // 获取并更新计数器
//     const counter = await Counter.findByIdAndUpdate(
//       { _id: 'mark' },          // 计数器名称
//       { $inc: { seq: 1 } },     // 自增计数器
//       { new: true, upsert: true } // 如果不存在则创建计数器
//     );

//     // 设置 mark 为新的计数器值
//     this.mark = counter.seq;
//   }
//   next();
// });
// const userInfoModel = mongoose.model("userInfo", userInfoSchema, "userInfo")
// userInfoModel.createIndexes([
//   // 创建 isApply 和 isAudit 字段的复合索引
//   {
//     key: { isApply: 1, isAudit: 1 },
//     name: "isApply_isAudit_index", // 可以设置索引名称
//     background: true, // 设置为背景索引，避免阻塞其他操作
//   },

//   // 针对 position 字段创建单字段索引
//   {
//     key: { position: 1 },
//     name: "position_index",
//     background: true,
//   },

//   // 针对 name 字段创建单字段索引
//   {
//     key: { name: 1 },
//     name: "name_index",
//     background: true,
//   },

//   // 针对 mark 字段创建单字段索引
//   {
//     key: { mark: 1 },
//     name: "mark_index",
//     background: true,
//   },
// ]);


// // 留言板
// const commentSchema = new mongoose.Schema({
//   uid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   },
//   name: String,
//   avtor: String,
//   startTime: {
//     type: Date,
//     default: Date.now,
//     get: function (value) {
//       const date = new Date(value);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       const seconds = String(date.getSeconds()).padStart(2, '0');
//       return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     }
//   },
//   audit: {
//     type: Boolean,
//     default: false
//   },
//   isPass: {
//     type: Boolean,
//     default: false
//   },
//   content: String,
//   cid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'user'
//   },
// })
// const commentModel = mongoose.model("comment", commentSchema, "comment")



// //投票信息
// const voteSchema = new mongoose.Schema({
//   dovoter: String,//投票的用户
//   actvoter: String,//被投的选手
//   votetime: {
//     type: Date,
//     default: Date.now()
//   },
//   voteDate: {
//     type: String,
//     default: ''
//   }
// })
// const voteModel = mongoose.model("vote", voteSchema, 'vote')
// //活动说明页
// const acspeakSchema = new mongoose.Schema({
//   imgsrc: String,
//   content: String
// })
// const acspeakModel = mongoose.model("acspeak", acspeakSchema, 'acspeak')
// //后门票数库
// const aftdoorSchema = new mongoose.Schema({
//   nid: String,
//   apid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "userInfo"
//   },
//   opa: Number
// })
// const aftdoorModel = mongoose.model("aftdoor", aftdoorSchema, 'aftdoor')

// // 订单系统
// const orderFormSchema = new mongoose.Schema({
//   orderId: String,  // 订单号
//   money: Number,    // 订单金额
//   title: String,    // 订单标题
//   buyerId: String,  // 买家
//   sellerId: String, // 被赠送者
//   buyerName: String, // 买家姓名
//   sellerName: String, // 被赠送者姓名
//   created_at: { type: Date, default: Date.now },  // 订单创建时间
//   updated_at: { type: Date, default: Date.now },  // 最后更新时间
//   status: {   // 订单状态
//     type: String,
//     enum: ['pending', 'paid', 'failed'],
//     default: 'pending'
//   },
//   paymentInfo: Object,  // 支付信息（支付成功后保存）
// })
// const orderFormModel = mongoose.model("orderForm", orderFormSchema, "orderForm")

// // 定义任务模型
// const taskSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userInfo', required: true }, // 用户 ID
//   voteIncrement: { type: Number, required: true }, // 增加的票数
//   executeAt: { type: Date, required: true }, // 执行时间
//   status: { type: String, enum: ['pending', 'completed'], default: 'pending' }, // 任务状态
//   createdAt: { type: Date, default: Date.now }, // 创建时间
// });
// const TaskModel = mongoose.model('Task', taskSchema, 'Task');

// const ctrlSchema = new mongoose.Schema({
//   act: String,
//   pwd: String
// })
// const ctrlModel = mongoose.model('ctrl', ctrlSchema, 'ctrl')



// module.exports = {
//   carouselModel,  //  轮播图
//   activityMsgModel, //  活动信息
//   positionModel,  //  职位
//   userInfoModel,//用户
//   voteModel,//投票信息
//   commentModel,//留言板
//   acspeakModel,//活动说明页
//   aftdoorModel,//票数操作库
//   orderFormModel,//订单系统
//   TaskModel,//任务系统
//   ctrlModel,//后台管理账号
//   registerModel,// 登录
// }
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
// 为 addTime 和 isDelete 添加索引
carouselSchema.index({ addTime: 1, isDelete: 1 });
const carouselModel = mongoose.model('carousel', carouselSchema, 'carousel')

// 登陆
const registerSchema = new mongoose.Schema({
  name: String,
  password: String,
  phone: String
})
// 为 name 和 phone 添加索引
registerSchema.index({ name: 1, phone: 1 });
const registerModel = mongoose.model("register", registerSchema, "register")

//活动信息
const activityMsgSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  joinNum: {
    type: Number,
    default: 0
  },
  accumulatedNum: {
    type: Number,
    default: 0
  },
  visitNum: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: Date.now
  },
  rule: {
    type: String,
    default: ""
  },
  announcement: {
    type: String,
    default: ""
  },
  isStart: {
    type: Boolean,
    default: false
  }
})
// 为 startTime、endTime 和 isStart 添加索引
activityMsgSchema.index({ startTime: 1, endTime: 1, isStart: 1 });
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
// 为 jobTitle 和 addTime 添加索引
positionSchema.index({ jobTitle: 1, addTime: 1 });
const positionModel = mongoose.model("position", positionSchema, "position")

//用户
const userInfoSchema = new mongoose.Schema({
  name: String,//姓名必填
  isApply: {//是否参赛默认就OK
    type: Boolean,
    default: false
  },
  vote: {//票数可以不要
    type: Number,
    default: 0
  },
  mark: {//不用添加
    type: Number,
    unique: true,
  },
  avtor: {
    type: String,
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAJX82J0tJmJfIyI0utQZIP1S9hG6zYI_3ZA&s"
  },//头像
  voteNum: {//投票的剩余票数,可以不添加
    type: Number,
    default: 2
  },
  position: {//职位必填
    type: mongoose.Schema.Types.ObjectId,
    ref: "position"
  },
  visitNum: {//访问量默认，后期进行修改
    type: Number,
    default: 0
  },
  addTime: {//默认添加
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
  gitflower: {
    type: Number,
    default: 0
  },
  isAudit: { // 简历审核是否通过
    type: Boolean,
    default: false
  },
  // deviceid: String,//设备指纹游客唯一id
  introduce: String,//简介
  // openid: String,//微信openid
  phone: String,
  pwd: String
})
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // 计数器名称
  seq: { type: Number, default: 0 },     // 当前计数器的值
});

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
// 为 isApply、isAudit、position、name 和 mark 添加索引
userInfoSchema.index({ isApply: 1, isAudit: 1 });
userInfoSchema.index({ position: 1 });
userInfoSchema.index({ name: 1 });
userInfoSchema.index({ mark: 1 });
const userInfoModel = mongoose.model("userInfo", userInfoSchema, "userInfo")

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
  isPass: {
    type: Boolean,
    default: false
  },
  content: String,
  cid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
})
// 为 uid、startTime、audit 和 isPass 添加索引
commentSchema.index({ uid: 1, startTime: 1, audit: 1, isPass: 1 });
const commentModel = mongoose.model("comment", commentSchema, "comment")

//投票信息
const voteSchema = new mongoose.Schema({
  dovoter: String,//投票的用户
  actvoter: String,//被投的选手
  votetime: {
    type: Date,
    default: Date.now()
  },
  voteDate: {
    type: String,
    default: ''
  }
})
// 为 dovoter、actvoter 和 votetime 添加索引
voteSchema.index({ dovoter: 1, actvoter: 1, votetime: 1 });
const voteModel = mongoose.model("vote", voteSchema, 'vote')

//活动说明页
const acspeakSchema = new mongoose.Schema({
  imgsrc: String,
  content: String
})
// 为 imgsrc 添加索引
acspeakSchema.index({ imgsrc: 1 });
const acspeakModel = mongoose.model("acspeak", acspeakSchema, 'acspeak')

//后门票数库
const aftdoorSchema = new mongoose.Schema({
  nid: String,
  apid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userInfo"
  },
  opa: Number
})
// 为 nid 和 apid 添加索引
aftdoorSchema.index({ nid: 1, apid: 1 });
const aftdoorModel = mongoose.model("aftdoor", aftdoorSchema, 'aftdoor')

// 订单系统
const orderFormSchema = new mongoose.Schema({
  orderId: String,  // 订单号
  money: Number,    // 订单金额
  title: String,    // 订单标题
  buyerId: String,  // 买家
  sellerId: String, // 被赠送者
  buyerName: String, // 买家姓名
  sellerName: String, // 被赠送者姓名
  created_at: { type: Date, default: Date.now },  // 订单创建时间
  updated_at: { type: Date, default: Date.now },  // 最后更新时间
  status: {   // 订单状态
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentInfo: Object,  // 支付信息（支付成功后保存）
})
// 为 orderId、buyerId、sellerId 和 status 添加索引
orderFormSchema.index({ orderId: 1, buyerId: 1, sellerId: 1, status: 1 });
const orderFormModel = mongoose.model("orderForm", orderFormSchema, "orderForm")

// 定义任务模型
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userInfo', required: true }, // 用户 ID
  voteIncrement: { type: Number, required: true }, // 增加的票数
  executeAt: { type: Date, required: true }, // 执行时间
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }, // 任务状态
  createdAt: { type: Date, default: Date.now }, // 创建时间
});
// 为 userId、executeAt 和 status 添加索引
taskSchema.index({ userId: 1, executeAt: 1, status: 1 });
const TaskModel = mongoose.model('Task', taskSchema, 'Task');

const ctrlSchema = new mongoose.Schema({
  act: String,
  pwd: String
})
// 为 act 添加索引
ctrlSchema.index({ act: 1 });
const ctrlModel = mongoose.model('ctrl', ctrlSchema, 'ctrl')

module.exports = {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
  aftdoorModel,//票数操作库
  orderFormModel,//订单系统
  TaskModel,//任务系统
  ctrlModel,//后台管理账号
  registerModel,// 登录
}