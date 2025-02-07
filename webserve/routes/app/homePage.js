var express = require('express');
var router = express.Router();
const moment = require('moment-timezone'); // 使用 moment-timezone 处理时区
var {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
  aftdoorModel,//票数操作库
} = require("../../model/model");
const { ObjectId } = require('mongodb');
// 异步中间件：获取投票数据并更新用户的投票数
const updateVotesMiddleware = async (req, res, next) => {
  // 使用 setImmediate 将异步任务放入下一轮事件循环，确保不阻塞响应
  setImmediate(async () => {
    // try {
    //   // 获取所有申请的用户
    //   let aplyusers = await userInfoModel.find({ isApply: true }).lean();

    //   // 并行执行所有用户的投票更新任务
    //   const updatePromises = aplyusers.map(async (item) => {
    //     // 获取 actvotes
    //     let actvotes = await voteModel.find({ actvoter: item._id }).countDocuments();

    //     // 获取 aftdoorvotels
    //     let aftdoorvotels = await aftdoorModel.find({ apid: item._id }).lean();

    //     // 计算 apuallvotes
    //     let apuallvotes = actvotes;
    //     for (let aftdoor of aftdoorvotels) {
    //       apuallvotes += aftdoor.opa;
    //     }

    //     // 更新用户的投票数
    //     await userInfoModel.updateOne({ _id: item._id }, { vote: apuallvotes });
    //   });

    //   // 等待所有投票更新任务完成
    //   await Promise.all(updatePromises);
    // } catch (error) {
    //   console.error('Error updating votes:', error);
    // }

    // 不影响接口响应速度，继续传递控制权
    next();
  });
};
//游客进入页面根据Fingerprint生成id,存储游客id创建游客
router.post("/addtourist", async (req, res) => {
  let { deviceid } = req.body;

  try {
    // 检查 deviceid 是否已经存在
    const existingUser = await userInfoModel.findOne({ deviceid: deviceid });

    if (existingUser) {
      // 如果 deviceid 已经存在，返回提示信息
      return res.send({
        code: 400,
        msg: "Device ID already exists",
        useruser: existingUser // 返回已存在记录的 _id
      });
    }

    // 创建新的用户记录
    const newUser = await userInfoModel.create({ deviceid: deviceid });

    // 返回创建的用户的 _id
    return res.send({
      code: 200,
      msg: "Tourist added successfully",
      user: newUser // 返回新创建记录的 _id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      code: 500,
      msg: "Server error",
    });
  }
});



router.get("/getaplyuser", async (req, res) => {
  try {
    let { nowPage = 1, pageSize = 6, positionid = '', searchcontent = '', fsc = '' } = req.query;

    // 获取已报名且审核通过的用户的ID（isApply 和 isAudit 都为 true）
    let idArr = await userInfoModel.find({ isApply: true, isAudit: true }).select('_id').lean();
    let ids = idArr.map(i => i._id);

    // 构建基础聚合管道
    let pipeline = [
      { $match: { _id: { $in: ids } } }, // 只查询已报名且审核通过的用户
      {
        $lookup: {
          localField: "position",
          foreignField: "_id",
          from: "position",
          as: "position"
        }
      },
    ];

    // 添加排序
    if (fsc === '最热' || fsc === '排行') {
      pipeline.push({ $sort: { vote: -1 } });
    } else if (fsc === '最新') {
      pipeline.push({ $sort: { addTime: -1 } });
    }

    // 添加搜索内容过滤
    if (searchcontent) {
      const mark = Number(searchcontent);
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchcontent} }, // 模糊匹配名称，忽略大小写
            { mark: !isNaN(mark) ? mark : null }, // 精确匹配编号，如果不是数字则忽略
          ].filter(condition => condition.mark !== null) // 过滤掉无效的mark条件
        }
      });
    }

    // 添加职位ID过滤
    if (positionid) {
      pipeline.push({
        $match: {
          "position._id": new ObjectId(positionid),
        },
      });
    }

    // 使用 $facet 同时获取分页数据和总数
    pipeline.push({
      $facet: {
        users: [
          { $skip: (Number(nowPage) - 1) * Number(pageSize) },
          { $limit: Number(pageSize) }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    });

    // 执行聚合管道
    let result = await userInfoModel.aggregate(pipeline);

    // 提取结果
    const users = result[0].users;
    const userstotal = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

    res.send({
      code: 200,
      users: users,
      userstotal: userstotal,
      ids: ids
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ code: 500, message: '服务器内部错误' });
  }
});


// 获取轮播图
router.get('/getCarousel', async (req, res) => {
  let carousel;
  let { page = 1, pagesize = 5 } = req.query
  try {
    carousel = await carouselModel.find({ isDelete: true }).skip((page - 1) * pagesize).limit(pagesize)
  } catch (err) {
    res.json({ code: 500, msg: '获取轮播图失败', err })
  } finally {
    res.json({ code: 200, msg: '获取轮播图成功', data: carousel })
  }
})

// 添加访问量
router.get('/getVisit', async (req, res) => {
  try {
    const updatedActivity = await activityMsgModel.findOneAndUpdate({ isStart: true }, { $inc: { visitNum: 1 } }, { new: true })
    if (!updatedActivity) {
      return res.status(404).json({ code: 404, msg: '活动未找到' });
    }
    res.json({ code: 200, msg: '更新成功', data: updatedActivity })
  } catch (err) {
    res.json({ code: 500, msg: '更新失败', err })
  }
})

// 更新活动信息的访问量+1
router.put('/addActivityVisit', async (req, res) => {
  try {
    let data = await activityMsgModel.findOneAndUpdate({}, { $inc: { visitNum: 1 } }, { new: true })
    res.json({ code: 200, msg: '更新成功', data })
  } catch (err) {
    res.json({ code: 500, msg: '更新失败', err })
  }
})

// 获取所有职位信息
router.get('/getPositionMsg', async (req, res) => {
  try {
    let data = await positionModel.find()
    res.json({ code: 200, msg: '获取职位信息成功', data })
  } catch (err) {
    res.json({ code: 500, msg: '获取职位信息失败', err })
  }
})

// 首页获取用户职位
router.get('/getPosition', async (req, res) => {
  let data;
  let { position = '', page = 1, pagesize = 6 } = req.query
  try {
    if (data) {
      data = await userInfoModel.find({ position: position }).skip((page - 1) * pagesize).limit(pagesize)
    } else {
      data = await userInfoModel.find().skip((page - 1) * pagesize).limit(pagesize)
    }
  } catch (err) {
    res.json({
      code: 500,
      msg: "服务器错误",
      err
    })
  } finally {
    res.json({
      code: 200,
      msg: "成功",
      data
    })
  }
})

// 更新 - 界面访问量
router.put('/addVisit', async (req, res) => {
  try {
    let data = await activityMsgModel.findOneAndUpdate({ isStart: true }, { $inc: { visitNum: 1 } }, { new: true })
    res.json({ code: 200, msg: '更新成功', data })
  } catch (err) {
    res.json({
      code: 500,
      msg: "服务器错误",
      err
    })
  }
})

//投票接口
// router.post('/udvote', async (req, res) => {
//   const { voter_id, candidate_ids, vtime } = req.body;

//   // 步骤 1: 验证 candidate_ids 数组的长度，确保最多包含两个候选人 ID
//   if (!Array.isArray(candidate_ids) || candidate_ids.length === 0 || candidate_ids.length > 2) {
//     return res.status(400).json({ message: '至少投一个' });
//   }

//   // 获取当前日期（YYYY-MM-DD格式）
//   const today = new Date().toISOString().split('T')[0];

//   try {
//     // 步骤 2: 查找当前用户今天投票的记录
//     const voteRecords = await voteModel.find({
//       dovoter: voter_id,
//       votetime: { $gte: new Date(today) } // 查找今天的投票记录
//     });

//     // 步骤 3: 判断用户是否已投票超过两个候选人
//     if (voteRecords.length === 10) {
//       return res.status(400).json({ message: '每天只能投十次' });
//     }

//     // 步骤 4: 如果用户已投票一次，检查第二次是否传递了多个候选人
//     if (voteRecords.length === 1 && candidate_ids.length > 1) {
//       return res.status(400).json({ message: '今天还能投一次' });
//     }

//     // 步骤 5: 检查重复投票
//     const votedCandidates = voteRecords.map(record => record.candidate_id);
//     const newVotes = candidate_ids.filter(id => !votedCandidates.includes(id));

//     // 如果有已经投过票的候选人，提示不能重复投票
//     if (candidate_ids.length !== newVotes.length) {
//       return res.status(400).json({ message: '同一个选手一天只能投一次' });
//     }

//     // 步骤 6: 记录新的投票
//     const votesToInsert = newVotes.map(candidate_id => ({
//       dovoter: voter_id,
//       actvoter: candidate_id,
//       votetime: vtime,
//     }));

//     // 步骤 7: 获取所有被投票的候选人票数
//     await voteModel.insertMany(votesToInsert);

//     // 步骤 8: 计算当前用户已投票的总数
//     const totalVotes = await voteModel.find({
//       dovoter: voter_id,
//       votetime: { $gte: new Date(today) }
//     }).countDocuments();

//     // 步骤 9: 计算剩余可投票数
//     const remainingVotes = 10 - totalVotes;

//     return res.status(200).json({
//       message: '投票成功',
//       totalVotes,        // 用户当前已投的票数
//       remainingVotes     // 用户还可以投的票数
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: '错误' });
//   }
// });
// router.post('/udvote', async (req, res) => {
//   const { voter_id, candidate_ids, vtime } = req.body;
//   console.log(req.body);
  
//   // 步骤 1: 验证 voter_id 不能为空或 null
//   if (!voter_id || voter_id.trim() === '') {
//     return res.status(400).json({ message: 'voter_id 不能为空' });
//   }

//   // 步骤 2: 验证 candidate_ids 数组的长度，确保只能包含一个候选人 ID
//   if (!Array.isArray(candidate_ids) || candidate_ids.length !== 1) {
//     return res.status(400).json({ message: '每次只能投一个选手' });
//   }
//   const candidateId = candidate_ids[0];

//   // 获取当前日期并设置为 UTC 格式（00:00:00 到 23:59:59）
//   const todayStart = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0));
//   const todayEnd = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59));

//   try {
//     // 步骤 3: 查找当前用户今天投票的记录，确保时间在当天的 00:00:00 到 23:59:59 之间
//     const voteRecords = await voteModel.find({
//       dovoter: voter_id,
//       votetime: { $gte: todayStart, $lte: todayEnd } // 使用精准的时间范围
//     });

//     // 步骤 4: 判断用户是否已投票超过十次
//     if (voteRecords.length >= 10) {
//       return res.status(400).json({ message: '每天只能投十次' });
//     }

//     // 步骤 6: 记录新的投票
//     const voteToInsert = {
//       dovoter: voter_id,
//       actvoter: candidateId,
//       votetime: vtime,
//     };

//     // 步骤 7: 插入新的投票记录
//     await voteModel.create(voteToInsert);
//     // 步骤 7.5: 给候选人的 vote 字段加一
//     await userInfoModel.findOneAndUpdate(
//       { _id: candidateId },
//       { $inc: { vote: 1 } },
//       { new: true }
//     );
//     // 步骤 8: 计算当前用户已投票的总数
//     const totalVotes = await voteModel.find({
//       dovoter: voter_id,
//       votetime: { $gte: todayStart, $lte: todayEnd }
//     }).countDocuments();

//     // 步骤 9: 计算剩余可投票数
//     const remainingVotes = 10 - totalVotes;

//     return res.status(200).json({
//       message: '投票成功',
//       totalVotes,        // 用户当前已投的票数
//       remainingVotes     // 用户还可以投的票数
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: '服务器错误' });
//   }
// });
// router.post('/udvote', async (req, res) => {
//   const { voter_id, candidate_ids, vtime } = req.body;
//   console.log(req.body);

//   // 步骤 1: 验证 voter_id 不能为空或 null
//   if (!voter_id || voter_id.trim() === '') {
//     return res.status(400).json({ message: 'voter_id 不能为空' });
//   }

//   // 步骤 2: 验证 candidate_ids 数组的长度，确保只能包含一个候选人 ID
//   if (!Array.isArray(candidate_ids) || candidate_ids.length !== 1) {
//     return res.status(400).json({ message: '每次只能投一个选手' });
//   }
//   const candidateId = candidate_ids[0];

//   // 获取当前日期（基于时区），确保时间范围是从 00:00:00 到 23:59:59
//   const todayStart = moment().startOf('day').toDate();
//   const todayEnd = moment().endOf('day').toDate();

//   try {
//     // 步骤 3: 查找当前用户今天投票的记录，确保时间在当天的 00:00:00 到 23:59:59 之间
//     const voteRecords = await voteModel.find({
//       dovoter: voter_id,
//       votetime: { $gte: todayStart, $lte: todayEnd }
//     });

//     // 步骤 4: 判断用户是否已投票超过十次
//     if (voteRecords.length >= 10) {
//       return res.status(400).json({ message: '每天只能投十次' });
//     }

//     // 步骤 6: 记录新的投票
//     const voteToInsert = {
//       dovoter: voter_id,
//       actvoter: candidateId,
//       votetime: vtime,
//     };

//     // 使用事务来确保投票记录与候选人票数同步
//     const session = await voteModel.startSession();
//     session.startTransaction();

//     try {
//       // 步骤 7: 插入新的投票记录
//       await voteModel.create([voteToInsert], { session });

//       // 步骤 7.5: 给候选人的 vote 字段加一
//       await userInfoModel.findOneAndUpdate(
//         { _id: candidateId },
//         { $inc: { vote: 1 } },
//         { session, new: true }
//       );

//       // 提交事务
//       await session.commitTransaction();
//       session.endSession();

//       // 步骤 8: 计算当前用户已投票的总数
//       const totalVotes = voteRecords.length + 1; // 包含新投的一票

//       // 步骤 9: 计算剩余可投票数
//       const remainingVotes = 10 - totalVotes;

//       return res.status(200).json({
//         message: '投票成功',
//         totalVotes,        // 用户当前已投的票数
//         remainingVotes     // 用户还可以投的票数
//       });
//     } catch (err) {
//       // 发生错误，回滚事务
//       await session.abortTransaction();
//       session.endSession();
//       console.error(err);
//       return res.status(500).json({ message: '服务器错误' });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: '服务器错误' });
//   }
// });
router.post('/udvote', async (req, res) => {
  const { voter_id, candidate_ids, vtime } = req.body;
  console.log(req.body);

  // 步骤 1: 验证 voter_id 不能为空或 null
  if (!voter_id || voter_id.trim() === '') {
    return res.status(400).json({ message: 'voter_id 不能为空' });
  }

  // 步骤 2: 验证 candidate_ids 数组的长度，确保只能包含一个候选人 ID
  if (!Array.isArray(candidate_ids) || candidate_ids.length !== 1) {
    return res.status(400).json({ message: '每次只能投一个选手' });
  }
  const candidateId = candidate_ids[0];

  // 获取当前日期（基于时区），确保时间范围是从 00:00:00 到 23:59:59
  const todayStart = moment().startOf('day').toDate();
  const todayEnd = moment().endOf('day').toDate();

  try {
    // 步骤 3: 查找当前用户今天投票的记录，确保时间在当天的 00:00:00 到 23:59:59 之间
    const voteRecords = await voteModel.find({
      dovoter: voter_id,
      votetime: { $gte: todayStart, $lte: todayEnd }
    });

    // 步骤 4: 判断用户是否已投票超过十次
    if (voteRecords.length >= 10) {
      return res.status(400).json({ message: '每天只能投十次' });
    }

    // 步骤 6: 记录新的投票
    const voteToInsert = {
      dovoter: voter_id,
      actvoter: candidateId,
      votetime: vtime,
    };

    try {
      // 步骤 7: 插入新的投票记录
      await voteModel.create([voteToInsert]);

      // 步骤 7.5: 给候选人的 vote 字段加一
      await userInfoModel.findOneAndUpdate(
        { _id: candidateId },
        { $inc: { vote: 1 } },
        { new: true }
      );

      // 步骤 8: 计算当前用户已投票的总数
      const totalVotes = voteRecords.length + 1; // 包含新投的一票

      // 步骤 9: 计算剩余可投票数
      const remainingVotes = 10 - totalVotes;

      return res.status(200).json({
        message: '投票成功',
        totalVotes,        // 用户当前已投的票数
        remainingVotes     // 用户还可以投的票数
      });
    } catch (err) {
      // 插入投票记录或更新候选人票数时出错
      console.error('投票操作失败:', err);
      return res.status(500).json({ message: '服务器错误!' });
    }
  } catch (err) {
    // 查找投票记录时出错
    console.error('查询投票记录失败:', err);
    return res.status(500).json({ message: '服务器错误' });
  }
});


// 获取选手信息 -- 测试接口 待定
router.get('/getUsers', async (req, res) => {
  try {
    let { page = 1, pagesize = 6, vote = '', position = '', search = '' } = req.query
    let total;
    let result = []
    if (position) {
      result.push({ position: position })
    }
    if (search) {
      result.push({ name: { $regex: search } })
      result.push({ mark: search })
    }
    if (result.length > 0) {

      if (vote === '最热' || vote === '排行') {
        data = await userInfoModel.find({ $and: result }).skip((page - 1) * pagesize).limit(pagesize).sort({ vote: -1 })
        total = await userInfoModel.find({ $and: result }).countDocuments()
      } else if (vote === '最新') {
        data = await userInfoModel.find({ $and: result }).skip((page - 1) * pagesize).limit(pagesize).sort({ addTime: -1 })
        total = await userInfoModel.find({ $and: result }).countDocuments()
      } else {
        data = await userInfoModel.find({ $and: result }).skip((page - 1) * pagesize).limit(pagesize)
        total = await userInfoModel.find({ $and: result }).countDocuments()
      }
    } else {
      if (vote === '最热' || vote === '排行') {
        data = await userInfoModel.find().skip((page - 1) * pagesize).limit(pagesize).sort({ vote: -1 })
        total = await userInfoModel.countDocuments()
      } else if (vote === '最新') {
        data = await userInfoModel.find().skip((page - 1) * pagesize).limit(pagesize).sort({ addTime: -1 })
        total = await userInfoModel.countDocuments()
      } else {
        data = await userInfoModel.find().skip((page - 1) * pagesize).limit(pagesize)
        total = await userInfoModel.countDocuments()
      }
    }
    res.json({ code: 200, msg: '获取选手信息成功', data, total })

  } catch (err) {
    res.json({ code: 500, msg: '获取选手信息失败', err })
  }
})


//用户充值
router.post("/buygitflower", async (req, res) => {
  let { uid } = req.query
  let { flowernums } = req.body
  let user = await userInfoModel.findOne({ _id: uid })
  let updatenums = user.gitflower += flowernums
  await userInfoModel.updateOne({ _id: uid }, { gitflower: updatenums })
  res.send({
    code: 200,
    msg: "充值成功"
  })
})

//用户赠送鲜花
router.post("/dgitglower", async (req, res) => {
  let { nid, apid, opa } = req.body
  let user = await userInfoModel.findOne({ _id: nid })
  if (opa > user.gitflower) {
    res.send({
      code: 201,
      msg: "余额不足"
    })
  } else {
    await aftdoorModel.create(req.body)
    let nowflowers = user.gitflower - opa
    await userInfoModel.updateOne({ _id: nid }, { gitflower: nowflowers })
    res.send({
      code: 200,
      msg: "赠送成功"
    })
  }

})

//获取某个选手的总票数
router.get("/getapuservotes", async (req, res) => {
  let { apuid } = req.query
  let actvotes = await voteModel.find({ actvoter: apuid }).countDocuments()
  let aftdoorvotels = await aftdoorModel.find({ apid: apuid })
  let apuallvotes = 0;
  aftdoorvotels.forEach((item) => {
    actvotes += item.opa
  })
  apuallvotes = actvotes
  await userInfoModel.updateOne({ _id: apuid }, { vote: apuallvotes })
  res.send({
    code: 200,
    apuallvotes
  })
})

//获取所有投票记录
// router.get("/voteshistory", async (req, res) => {
//   let { page, pageSize } = req.query
//   let sends = await voteModel.aggregate([
//     {
//       $addFields: {
//         dovoter: { $toObjectId: "$dovoter" }, // 将字符串转换为 ObjectId
//         actvoter: { $toObjectId: "$actvoter" } // 同理转换另一个字段
//       }
//     },
//     {
//       $lookup: {
//         from: "userInfo",
//         localField: "dovoter",
//         foreignField: "_id",
//         as: "desc"
//       }
//     },
//     {
//       $lookup: {
//         from: "userInfo",
//         localField: "actvoter",
//         foreignField: "_id",
//         as: "desc2"
//       }
//     }
//   ])
//   let result = [];
//   let voteMap = new Map(); // 使用 Map 来累加相同 send 和 acp 的投票

//   sends.forEach((item) => {
//     const send = item.dovoter ? item.dovoter.toString() : ''; // 如果 dovoter 为 null 或 undefined，返回空字符串
//     const acp = item.actvoter ? item.actvoter.toString() : ''; // 同理，检查 actvoter
//     const vote = 1; // 这里的投票数为 1，按需修改

//     // 生成一个唯一的键来标识 `send` 和 `acp` 的组合
//     const key = `${send}-${acp}`;

//     // 检查该组合是否已经存在
//     if (voteMap.has(key)) {
//       // 如果存在，累加投票数
//       voteMap.get(key).vote += vote;
//     } else {
//       // 如果不存在，创建新的记录
//       voteMap.set(key, {
//         send: item.dovoter,
//         acp: item.actvoter,
//         vote: vote,
//         desc: item.desc,
//         desc2: item.desc2
//       });
//     }
//   });

//   // 将 Map 转换为结果数组
//   voteMap.forEach((value) => {
//     result.push(value);
//   });

//   const skip = (page - 1) * pageSize;
//   const limit = parseInt(pageSize);

//   // 获取当前页的数据
//   const pageData = result.slice(skip, skip + limit);

//   // 获取总数据条数
//   const totalItems = result.length;
//   res.send({
//     code: 200,
//     pageData,
//     totalItems,
//     totallen: pageData.length
//   })
// })
// router.get("/voteshistory", async (req, res) => {
//   let { page = 1, pageSize = 10 } = req.query;
//   page = parseInt(page);
//   pageSize = parseInt(pageSize);

//   try {
//     // 计算跳过的记录数
//     const skip = (page - 1) * pageSize;

//     // 聚合管道
//     const sends = await voteModel.aggregate([
//       {
//         $addFields: {
//           dovoter: { $toObjectId: "$dovoter" },
//           actvoter: { $toObjectId: "$actvoter" }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             dovoter: "$dovoter",
//             actvoter: "$actvoter"
//           },
//           vote: { $sum: 1 },
//           // 保留其他需要的字段，这里假设不需要保留原始文档的其他字段
//         }
//       },
//       {
//         $lookup: {
//           from: "userInfo",
//           localField: "dovoter",
//           foreignField: "_id",
//           as: "desc"
//         }
//       },
//       {
//         $lookup: {
//           from: "userInfo",
//           localField: "actvoter",
//           foreignField: "_id",
//           as: "desc2"
//         }
//       },
//       {
//         $skip: skip
//       },
//       {
//         $limit: pageSize
//       },
//       {
//         $project: {
//           _id: 0,
//           send: "$_id.dovoter",
//           acp: "$_id.actvoter",
//           vote: 1,
//           desc: 1,
//           desc2: 1
//         }
//       }
//     ]);

//     // 计算总记录数
//     const totalItems = await voteModel.aggregate([
//       {
//         $addFields: {
//           dovoter: { $toObjectId: "$dovoter" },
//           actvoter: { $toObjectId: "$actvoter" }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             dovoter: "$dovoter",
//             actvoter: "$actvoter"
//           },
//           vote: { $sum: 1 }
//         }
//       },
//       {
//         $count: "total"
//       }
//     ]).then(result => result.length > 0 ? result[0].total : 0);

//     res.send({
//       code: 200,
//       pageData: sends,
//       totalItems,
//       totallen: sends.length
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       code: 500,
//       message: "服务器内部错误"
//     });
//   }
// });
//获取某个选手的投票送礼，或者被投的记录
//获取所有投票记录
// router.get("/voteshistory", async (req, res) => {
//   let { page, pageSize } = req.query
//   let sends = await voteModel.aggregate([
//     {
//       $addFields: {
//         dovoter: { $toObjectId: "$dovoter" }, // 将字符串转换为 ObjectId
//         actvoter: { $toObjectId: "$actvoter" } // 同理转换另一个字段
//       }
//     },
//     {
//       $lookup: {
//         from: "userInfo",
//         localField: "dovoter",
//         foreignField: "_id",
//         as: "desc"
//       }
//     },
//     {
//       $lookup: {
//         from: "userInfo",
//         localField: "actvoter",
//         foreignField: "_id",
//         as: "desc2"
//       }
//     }
//   ])
//   let result = [];
//   let voteMap = new Map(); // 使用 Map 来累加相同 send 和 acp 的投票

//   sends.forEach((item) => {
//     const send = item.dovoter.toString();
//     const acp = item.actvoter.toString();
//     const vote = 1; // 这里的投票数为 1，按需修改

//     // 生成一个唯一的键来标识 `send` 和 `acp` 的组合
//     const key = `${send}-${acp}`;

//     // 检查该组合是否已经存在
//     if (voteMap.has(key)) {
//       // 如果存在，累加投票数
//       voteMap.get(key).vote += vote;
//     } else {
//       // 如果不存在，创建新的记录
//       voteMap.set(key, {
//         send: item.dovoter,
//         acp: item.actvoter,
//         vote: vote,
//         desc: item.desc,
//         desc2: item.desc2
//       });
//     }
//   });

//   // 将 Map 转换为结果数组
//   voteMap.forEach((value) => {
//     result.push(value);
//   });

//   const skip = (page - 1) * pageSize;
//   const limit = parseInt(pageSize);

//   // 获取当前页的数据
//   const pageData = result.slice(skip, skip + limit);

//   // 获取总数据条数
//   const totalItems = result.length;
//   res.send({
//     code: 200,
//     pageData,
//     totalItems,
//     totallen: pageData.length
//   })
// })
router.get("/voteshistory", async (req, res) => {
  try {
      // 获取查询参数，设置默认值
      let { page = 1, pageSize = 10 } = req.query;
      page = parseInt(page);
      pageSize = parseInt(pageSize);

      // 计算跳过的记录数
      const skip = (page - 1) * pageSize;

      const sends = await voteModel.aggregate([
          // 阶段 1: 将字符串转换为 ObjectId
          {
              $addFields: {
                  dovoter: { $toObjectId: "$dovoter" },
                  actvoter: { $toObjectId: "$actvoter" }
              }
          },
          // 阶段 2: 累加相同 send 和 acp 的投票
          {
              $group: {
                  _id: {
                      send: "$dovoter",
                      acp: "$actvoter"
                  },
                  vote: { $sum: 1 },
                  descFirst: { $first: "$dovoter" },
                  desc2First: { $first: "$actvoter" }
              }
          },
          // 阶段 3: 执行第一次 $lookup
          {
              $lookup: {
                  from: "userInfo",
                  localField: "_id.send",
                  foreignField: "_id",
                  as: "desc"
              }
          },
          // 阶段 4: 执行第二次 $lookup
          {
              $lookup: {
                  from: "userInfo",
                  localField: "_id.acp",
                  foreignField: "_id",
                  as: "desc2"
              }
          },
          // 阶段 5: 格式化输出
          {
              $project: {
                  _id: 0,
                  send: "$_id.send",
                  acp: "$_id.acp",
                  vote: 1,
                  desc: 1,
                  desc2: 1
              }
          },
          // 阶段 6: 分页操作
          { $skip: skip },
          { $limit: pageSize }
      ]);

      // 计算总数据条数
      const totalItems = await voteModel.aggregate([
          {
              $addFields: {
                  dovoter: { $toObjectId: "$dovoter" },
                  actvoter: { $toObjectId: "$actvoter" }
              }
          },
          {
              $group: {
                  _id: {
                      send: "$dovoter",
                      acp: "$actvoter"
                  }
              }
          },
          { $count: "total" }
      ]).then((result) => result.length > 0 ? result[0].total : 0);

      res.send({
          code: 200,
          pageData: sends,
          totalItems,
          totallen: sends.length
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
          code: 500,
          message: "Internal Server Error"
      });
  }
});
router.get("/sinaplyvotes", async (req, res) => {
  let { vid, voice, page, pageSize } = req.query
  //所有的记录
  let sends = await voteModel.aggregate([
    {
      $addFields: {
        dovoter: { $toObjectId: "$dovoter" }, // 将字符串转换为 ObjectId
        actvoter: { $toObjectId: "$actvoter" } // 同理转换另一个字段
      }
    },
    {
      $lookup: {
        from: "userInfo",
        localField: "dovoter",
        foreignField: "_id",
        as: "desc"
      }
    },
    {
      $lookup: {
        from: "userInfo",
        localField: "actvoter",
        foreignField: "_id",
        as: "desc2"
      }
    }
  ])


  let result = [];
  let voteMap = new Map(); // 使用 Map 来累加相同 send 和 acp 的投票

  sends.forEach((item) => {
    const send = item.dovoter.toString();
    const acp = item.actvoter.toString();
    const vote = 1; // 这里的投票数为 1，按需修改

    // 生成一个唯一的键来标识 `send` 和 `acp` 的组合
    const key = `${send}-${acp}`;

    // 检查该组合是否已经存在
    if (voteMap.has(key)) {
      // 如果存在，累加投票数
      voteMap.get(key).vote += vote;
    } else {
      // 如果不存在，创建新的记录
      voteMap.set(key, {
        send: item.dovoter,
        acp: item.actvoter,
        vote: vote,
        desc: item.desc,
        desc2: item.desc2
      });
    }
  });

  // 将 Map 转换为结果数组
  voteMap.forEach((value) => {
    result.push(value);
  });
  flowers.forEach((item) => {
    result.push(
      {
        send: item.dovoter,
        acp: item.actvoter,
        vote: item.opa,
        desc: item.desc,
        desc2: item.desc2
      }
    )
  })
  console.log(result);

  let filterdata;
  if (voice === 'active') {
    filterdata = result.filter((item) => {
      item.desc[0]._id = new ObjectId(vid)
    })
  }
  if (voice === 'passive') {
    filterdata = result.filter((item) => {
      item.desc2[0]._id = new ObjectId(vid)
    })
  }
  const skip = (page - 1) * pageSize;
  const limit = parseInt(pageSize);
  console.log(filterdata);

  // 获取当前页的数据
  const pageData = filterdata.slice(skip, skip + limit);

  // 获取总数据条数
  const totalItems = filterdata.length;
  res.send({
    code: 2000,
    pageData,
    totalItems,
    totallen: pageData.length
  })
})
module.exports = router;