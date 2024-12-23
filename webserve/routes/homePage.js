var express = require('express');
var router = express.Router();
var {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
  aftdoorModel,//票数操作库
} = require("../model/model");
//获取所有首页选手
router.get("/getaplyuser", async (req, res) => {
  let { nowPage = 1, pageSize = 6, positionid, searchcontent, fsc } = req.query

  let idArr = await userInfoModel.find().lean() //无分页，判断是否报名
  let ids = idArr.filter(item => item.isCheck).map(i => i._id)
  let pieline = [
    {
      $lookup: {
        localField: "position",
        foreignField: "_id",
        from: "position",
        as: "position"
      }
    },

  ];
  if (fsc == 'hot') {
    pieline.push(
      {
        $sort: {
          vote: -1
        }
      }
    )
  }
  if (fsc == 'new') {
    pieline.push(
      {
        $sort: {
          addTime: -1
        }
      }
    )
  }
  if (searchcontent) {
    pieline.push({
      $match: {
        $or: [
          { name: { $regex: searchcontent } }, // 模糊匹配名称
          { mark: Number(searchcontent) }, // 精确匹配编号
        ],
      },
    });
  }
  if (positionid) {
    pieline.push({
      $match: {
        "position._id": new ObjectId(positionid), // 转换为 ObjectId
      },
    });
  }
  pieline.push({
    $skip: (nowPage - 1) * pageSize
  })
  pieline.push(
    {
      $limit: Number(pageSize)
    }
  )
  let users = await userInfoModel.aggregate(pieline)
  let userstotal = await userInfoModel.countDocuments()
  res.send({
    code: 200,
    users: users,
    userstotal: userstotal,
    ids: ids
  })
})
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

// 获取活动信息
router.get('/getActivityMsg', async (req, res) => {
  let data;
  try {
    data = await activityMsgModel.find().lean()
    if (new Date() > data[0].endTime) {
      return res.json({ code: 500, msg: '活动已结束' })
    } else {
      res.json({ code: 200, msg: '获取活动信息成功', data })
    }

  } catch (err) {
    res.json({ code: 500, msg: '获取活动信息失败', err })
  }
})

// 获取选手信息
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

// 首页根据用户职位
router.get('/getPosition', async (req, res) => {
  let data;
  let { position = '', page = 1, pagesize = 6 } = req.query
  try {
    data = await userInfoModel.find({ position: position }).skip((page - 1) * pagesize).limit(pagesize)
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
  let data;
  try {
    data = await visitModel.findOneAndUpdate({}, { $inc: { visit: 1 } }, { new: true })
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

//投票接口
router.post('/udvote', async (req, res) => {
  const { voter_id, candidate_ids, vtime } = req.body;
  console.log(voter_id, candidate_ids, candidate_ids.length);

  // 步骤 1: 验证 candidate_ids 数组的长度，确保最多包含两个候选人 ID
  if (!Array.isArray(candidate_ids) || candidate_ids.length === 0 || candidate_ids.length > 2) {
    return res.status(400).json({ message: '至少投一个' });
  }

  // 获取当前日期（YYYY-MM-DD格式）
  const today = new Date().toISOString().split('T')[0];

  try {
    // 步骤 2: 查找当前用户今天投票的记录
    const voteRecords = await voteModel.find({
      dovoter: voter_id,
      votetime: { $gte: new Date(today) } // 查找今天的投票记录
    });

    // 步骤 3: 判断用户是否已投票超过两个候选人
    if (voteRecords.length === 2) {
      return res.status(400).json({ message: '每天只能投两次' });
    }

    // 步骤 4: 如果用户已投票一次，检查第二次是否传递了多个候选人
    if (voteRecords.length === 1 && candidate_ids.length > 1) {
      return res.status(400).json({ message: '今天还能投一次' });
    }

    // 步骤 5: 检查重复投票
    const votedCandidates = voteRecords.map(record => record.candidate_id);
    const newVotes = candidate_ids.filter(id => !votedCandidates.includes(id));

    // 如果有已经投过票的候选人，提示不能重复投票
    if (candidate_ids.length !== newVotes.length) {
      return res.status(400).json({ message: '同一个选手一天只能投一次' });
    }

    // 步骤 6: 记录新的投票
    const votesToInsert = newVotes.map(candidate_id => ({
      dovoter: voter_id,
      actvoter: candidate_id,
      votetime: vtime,
    }));
    // 步骤 7: 获取所有被投票的候选人票数
    const voteCounts = await voteModel.aggregate([
      { $group: { _id: "$candidate_id", totalVotes: { $sum: 1 } } }
    ]);
    console.log(voteCounts);
    console.log(votesToInsert);

    await voteModel.insertMany(votesToInsert);
    await userInfoModel.updateMany({ _id: { $in: candidate_ids } }, { isCheck: false })
    return res.status(200).json({ message: '投票成功' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '错误' });
  }
});

module.exports = router;