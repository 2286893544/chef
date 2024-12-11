var express = require('express');
var router = express.Router();
var { carouselModel, activityMsgModel, positionModel, userInfoModel, voteModel, commentModel, acspeakModel } = require("../model/model")
var multiparty = require('multiparty')
var path = require('path')
var fs = require('fs')

// 上传图片
router.post("/upload", (req, res) => {
  //创建一个表单对象
  let form = new multiparty.Form()
  //设计图片上传路径
  form.uploadDir = 'upload'
  //解析form对象
  form.parse(req, (err, file, data) => {
    if (err) {
      res.status(500).json({ code: 500, msg: err })
    } else {
      let imgSrc = data.file[0].path
      let patharr = imgSrc.split("\\")
      let imgpath = patharr.join("/")
      res.status(200).send({
        code: 200,
        msg: "图片上传成功",
        path: imgpath
      });
    }
  })
})
//
router.post("/uploadr", (req, res) => {
  //创建一个表单对象
  let form = new multiparty.Form()
  //设计图片上传路径
  form.uploadDir = 'upload'
  //解析form对象
  form.parse(req, (err, file, data) => {
    if (err) {
      res.status(500).json({ code: 500, msg: err })
    } else {
      let imgSrc = data.file[0].path
      let patharr = imgSrc.split("\\")
      let imgpath = patharr.join("/")
      console.log(imgpath);
      res.send({
        code: 200,
        errno: 0,
        data: {
          url: `http://1.92.114.25:6624/${imgpath}`
        }
      })
    }
  })
})
// 添加轮播图
router.post("/addCarousel", (req, res) => {
  carouselModel.create(req.body)
  res.status(200).send({
    code: 200,
    msg: "添加成功"
  })
})

// 请求轮播图数据
router.get("/getCarousel", async (req, res) => {
  let { page = 1, pageSize = 5 } = req.query
  let data = await carouselModel.find().skip((page - 1) * pageSize).limit(pageSize);
  let total = await carouselModel.find().countDocuments()
  res.status(200).send({
    code: 200,
    msg: "请求成功",
    data,
    total
  })
})

// 删除轮播图
router.delete("/delCarousel/:_id", async (req, res) => {
  try {
    // 查询数据
    const data = await carouselModel.findOne({ _id: req.params._id });

    // 检查数据是否存在
    if (!data) {
      return res.status(404).send({ code: 404, msg: "数据未找到" });
    }

    // 检查 imgPath 是否存在
    if (!data.imgPath) {
      return res.status(400).send({ code: 400, msg: "图片路径不存在" });
    }

    // 解析文件路径
    const imgFileName = path.basename(data.imgPath); // 获取文件名
    const filePath = path.join(__dirname, '../upload', imgFileName);

    // 删除文件
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("文件删除失败:", err);
        return res.status(500).send({ message: '文件删除失败', error: err.message });
      }

      // 删除数据库记录
      await carouselModel.deleteOne({ _id: req.params._id });
      res.status(200).send({ code: 200, msg: "删除成功", data });
    });
  } catch (error) {
    console.error("删除轮播图时发生错误:", error);
    res.status(500).send({ code: 500, msg: "服务器错误", error: error.message });
  }
});


// 更改轮播图状态
router.put("/updateCarousel/:_id", async (req, res) => {
  try {
    let data = await carouselModel.findOne({ _id: req.params._id })
    if (data.isDelete) {
      await carouselModel.updateOne({ _id: req.params._id }, { isDelete: false })
    } else {
      await carouselModel.updateOne({ _id: req.params._id }, { isDelete: true })
    }
    res.status(200).send({ code: 200, msg: "修改成功" })
  } catch (err) {
    res.status(500).send({ code: 500, msg: "修改失败", err })
  }
})


//添加活动信息
router.post("/addactivityMsg", (req, res) => {
  console.log(req.body);

  activityMsgModel.create(req.body)
  res.send({
    code: 200
  })
})

//获取所有活动信息
router.get("/getactives", async (req, res) => {
  let activityMsgs = await activityMsgModel.find()
  res.send({
    code: 200,
    activityMsgs
  })
})
//修改活动信息
router.post("/updactive", async (req, res) => {
  console.log(req.query);
  console.log(req.body);
  await activityMsgModel.updateOne({ _id: req.query.updid }, req.body)
  res.send({
    code: 200
  })
})
//删除活动信息
router.delete("/delactive", async (req, res) => {
  await activityMsgModel.deleteOne({ _id: req.query.delid })
  res.send({
    code: 200
  })
})

// 添加职位
router.post("/addPosition", async (req, res) => {
  try {
    await positionModel.create(req.body)
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "添加失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      msg: "添加成功"
    })
  }
})

// 获取所有职位信息
router.get("/getPosition", async (req, res) => {
  let page = req.query.page || 1
  let pageSize = req.query.pageSize || 10
  let data = await positionModel.find().skip((page - 1) * pageSize).limit(pageSize);
  let total = await positionModel.find().countDocuments()
  res.status(200).send({
    code: 200,
    data,
    total
  })
})

// 更新职位信息
router.put("/updatePosition", async (req, res) => {
  try {
    await positionModel.updateOne({ _id: req.body._id }, req.body)
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "更新失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      msg: "更新成功"
    })
  }

})

// 删除职位信息
router.delete("/delPosition", async (req, res) => {
  try {
    await positionModel.deleteOne({ _id: req.query.id })
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "删除失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      msg: "删除成功"
    })
  }
})



//添加用户
router.post("/adduser", (req, res) => {
  userInfoModel.create(req.body)
  res.send({
    code: 200
  })
})
//获取所有用户
router.get("/getuser", async (req, res) => {
  let { nowPage, pageSize } = req.query
  // let users = await userInfoModel.find().skip( ( nowPage - 1 ) * pageSize ).limit( pageSize )
  let users = await userInfoModel.aggregate([
    {
      $lookup: {
        localField: "position",
        foreignField: "_id",
        from: "position",
        as: "position"
      }
    },
    {
      $skip: (nowPage - 1) * pageSize
    },
    {
      $limit: Number(pageSize)
    }
  ])
  let userstotal = await userInfoModel.countDocuments()
  res.send({
    code: 200,
    users: users,
    userstotal: userstotal
  })
})
//获取所有选手
router.get("/getuserapply", async (req, res) => {
  let { nowPage, pageSize } = req.query
  let usersa = await userInfoModel.aggregate([
    {
      $match: { isApply: true }
    },
    {
      $lookup: {
        localField: "position",
        foreignField: "_id",
        from: "position",
        as: "position"
      }
    },
    {
      $skip: ( nowPage - 1 ) * pageSize
    },
    {
      $limit: Number(pageSize)
    }
  ])
  let usersatotal = await userInfoModel.countDocuments()
  res.send({
    code: 200,
    usersa: usersa,
    usersatotal: usersatotal
  })
})


// 添加留言信息
router.post("/addComment", async (req, res) => {
  try {
    let userInfo = await userInfoModel.findOne({ _id: req.body.uid })
    req.body.avtor = userInfo.avtor
    req.body.name = userInfo.name
    await commentModel.create(req.body)
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "添加失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      msg: "添加成功"
    })
  }
})

// 获取留言信息
router.get("/getComment", async (req, res) => {
  const { cid, page, pageSize } = req.query
  let data;
  let total;
  try {
    data = await commentModel.find({ cid }).skip((page - 1) * pageSize).limit(pageSize);
    total = await commentModel.find({ cid }).countDocuments()
  }
  catch (err) {
    res.status(500).send({
      code: 500,
      msg: "获取失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      data,
      total
    })
  }
})
// 更改审核状态
router.put("/updateComment", async (req, res) => {

  const { _id } = req.body
  try {
    let data = await commentModel.findOne({ _id })
    if (data.audit) {
      await commentModel.updateOne({ _id }, { audit: false })
    } else {
      await commentModel.updateOne({ _id }, { audit: true })
    }
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "更新失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      msg: "更新成功"
    })
  }
})
// 删除留言
router.delete("/delComment", async (req, res) => {
  try {
    await commentModel.deleteOne({ _id: req.query.id })
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "删除失败",
      err
    })
  } finally {
    res.status(200).send({
      code: 200,
      msg: "删除成功"
    })
  }
})



// 首页获取展示信息
router.get("/getShow", async (req, res) => {
  try {
    let data = await userInfoModel.find().lean()
    let poData = await positionModel.find().lean()

    const poDataMap = poData.reduce((map, po) => {
      map[po._id.toString()] = po.jobTitle; // 将职位ID（po._id）映射到职位名称（po.jobTitle）
      return map;
    }, {});

    data.forEach(item => {
      const jobName = poDataMap[item.position.toString()]; // 查找对应职位名称
      if (jobName) {
        item.jobName = jobName;  // 如果找到了职位名称，添加到用户对象
      }
    });

    let jobDistribution = {}
    data.forEach(item => {
      if (jobDistribution[item.jobName]) {
        jobDistribution[item.jobName]++;
      } else {
        jobDistribution[item.jobName] = 1;
      }
    })
    // jobDistribution转换成数组
    jobDistribution = Object.entries(jobDistribution).map(([name, value]) => ({ name, value }));

    res.send({
      code: 200,
      jobDistribution,
    })
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "获取失败",
      err
    })
  }
})

router.get("/getDetail", async (req, res) => {
  try {
    // 获取并处理用户数据
    let data = await userInfoModel.find().lean();
    data = data.filter(item => item.isApply); // 筛选有效用户
    data.sort((a, b) => b.vote - a.vote); // 根据票数排序

    // 获取职位数据并构建职位ID到职位名称的映射
    let poData = await positionModel.find().lean();
    const poDataMap = poData.reduce((map, po) => {
      map[po._id.toString()] = po.jobTitle;
      return map;
    }, {});

    // 为每个用户添加职位名称
    data.forEach(item => {
      const jobName = poDataMap[item.position.toString()];
      if (jobName) item.jobName = jobName;
    });

    // 构建职位统计数据
    let data_things = [];
    let jobTypeData = {};  // 存储职位类型统计数据

    data.forEach(item => {
      const { jobName, vote, name } = item;

      // 累计职位投票和计数
      if (!jobTypeData[jobName]) {
        jobTypeData[jobName] = { count: 0, vote: 0, name: jobName, children: [] };
      }

      jobTypeData[jobName].count++;
      jobTypeData[jobName].vote += vote;
      jobTypeData[jobName].children.push([name, vote, jobName]);
    });

    // 生成一级数据
    let data_list = Object.entries(jobTypeData).map(([name, value]) => (
      [name, value.vote, 'things', name]
    ));

    // 将一级数据添加到 data_things
    data_things.push(data_list);

    // 生成职位类型数据（只取每个职位的前10条数据）
    Object.values(jobTypeData).forEach(({ children }) => {
      // 只取前20条数据
      const limitedChildren = children.slice(0, 10);
      if (limitedChildren.length > 0) {
        data_things.push(limitedChildren);
      }
    });

    res.send({
      code: 200,
      data_things   // 返回职位统计数据
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "获取失败",
      err
    });
  }
});




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
    await userInfoModel.updateMany({_id: { $in: candidate_ids }}, { isCheck: false })
    return res.status(200).json({ message: '投票成功' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '错误' });
  }
});

router.put('/changeRichText', async (req, res) => {
  let { id, content } = req.body;
  console.log(content)
  try {
    await userInfoModel.updateOne({ _id: id }, { richText: content });
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "修改失败",
      err
    })
  } finally {
    res.send({
      code: 200,
      msg: "修改成功"
    })
  }
})
//添加活动说明
router.post("/addacspackimg", (req, res) => {
  acspeakModel.create(req.body)
  res.send({
    code: 200
  })
})
//获取所有活动说明图片
router.get("/getacspimgs", async (req, res) => {
  let asimgs = await acspeakModel.find()
  res.send({
    code: 200,
    asimgs
  })
})
//删除说明活动图片
router.delete("/delacspk", async (req, res) => {
  let { did } = req.query
  await acspeakModel.deleteOne({ _id: did })
  res.send({
    code: 200
  })
})
//改变选手的选中和非选中状态
router.post("/cgeuchk", async(req, res) => {
  let { auid } = req.body
  await userInfoModel.updateOne({_id: auid}, { isCheck: !isCheck })
  res.send({
    code: 200
  })
})
//取消所有选中选手
router.post("/cgeuchks", async(req, res) => {
  let { auids } = req.body
  await userInfoModel.updateMany({_id: { $in: auids }}, { isCheck: false })
  res.send({
    code: 200
  })
})
module.exports = router;
