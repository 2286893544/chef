var express = require('express');
var router = express.Router();
var { carouselModel, activityMsgModel, positionModel, userInfoModel, commentModel } = require("../model/model")
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
  let data = await carouselModel.findOne({ _id: req.params._id })
  const filePath = path.join(__dirname, '../upload', path.basename(data.imgPath.split("\\")[1]));
  await fs.unlink(filePath, async (err) => {
    if (err) {
      console.log(err)
      return res.status(500).send({ message: 'File deletion failed', error: err.message });
    }
    await carouselModel.deleteOne({ _id: req.params._id })
    res.status(200).send({ code: 200, msg: "删除成功", data })
  });
})

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
  let users = await userInfoModel.find()
  res.send({
    code: 200,
    users: users
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

    // 生成职位类型数据（只取每个职位的前20条数据）
    Object.values(jobTypeData).forEach(({ children }) => {
      // 只取前20条数据
      const limitedChildren = children.slice(0, 20);
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




module.exports = router;
