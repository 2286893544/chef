var express = require('express');
var axios = require("axios")
var router = express.Router();
var { carouselModel, activityMsgModel, positionModel, userInfoModel, voteModel, commentModel, acspeakModel, aftdoorModel, ctrlModel } = require("../../model/model")
var multiparty = require('multiparty')
var fs = require('fs')
const { ObjectId } = require('mongodb');
var fs = require('fs')
var path = require('path')
const jwt = require('jsonwebtoken');
//h5微信一键授权登录接口
// 微信公众号的 AppID 和 AppSecret
const APP_ID = 'wxc84327f9bba81aff';
const APP_SECRET = '22314139308c82d14fc443f005443bd8';

// 后端获取微信用户信息接口

router.get('/wechat-login', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send({
      message: '授权码为空',
    });
  }

  try {
    // 1. 使用授权码 (code) 获取 access_token 和 openid
    const response = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
      params: {
        appid: APP_ID,
        secret: APP_SECRET,
        code,
        grant_type: 'authorization_code',
      },
    });

    const { access_token, openid, errcode, errmsg } = response.data;

    // 检查是否返回了错误
    if (errcode) {
      return res.status(500).json({
        message: `微信授权失败，错误码：${errcode}`,
        error: errmsg || '未提供错误信息',
      });
    }

    // 2. 使用 access_token 和 openid 获取用户信息
    const userInfoResponse = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
      params: {
        access_token,
        openid,
        lang: 'zh_CN',
      },
    });

    const userInfo = userInfoResponse.data;

    // 再次检查是否返回了错误
    if (userInfo.errcode) {
      return res.status(500).json({
        message: `获取用户信息失败，错误码：${userInfo.errcode}`,
        error: userInfo.errmsg || '未提供错误信息',
      });
    }

    // 3. 查询数据库中是否已有此 openid 的用户
    let user = await userInfoModel.findOne({ openid });

    if (!user) {
      // 4. 如果没有找到用户，创建新用户
      user = new User({
        name: userInfo.nickname,
        avtor: userInfo.headimgurl,
        openid,
      });
      await user.save(); // 保存新用户
    } else {
      // 5. 如果用户已存在，可以选择更新用户信息
      user.avtor = userInfo.headimgurl;
      user.name = userInfo.nickname;
      await user.save(); // 更新用户
    }

    // 6. 返回微信用户信息
    res.json({
      message: '微信授权登录成功',
      data: user,
    });
  } catch (error) {
    console.error(error);
    // 如果 catch 发生错误，返回500错误并详细记录错误信息
    res.status(500).json({
      message: '微信授权登录失败',
      error: error.message,
    });
  }
});
//注册
router.post('/register', async (req, res) => {
  let { phoneNum, pwd } = req.body
  // 验证请求体
  if (!phoneNum || !pwd) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  // 检查用户是否已注册
  const existingUser = await userInfoModel.findOne({ phone: phoneNum })
  if (existingUser) {
    return res.status(400).json({ error: '手机号已注册' });
  }
  await userInfoModel.create({ phone: phoneNum, pwd: pwd})
  res.send({
    code: 200,
    msg: "reg ok!"
  })
})
//登录
router.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;
  console.log(phoneNumber, password);

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: '手机号和密码不能为空' });
  }

  // 检查用户是否存在
  const user = await userInfoModel.findOne({ phone: phoneNumber })
  if (!user) {
    return res.status(401).json({ error: '手机号或密码错误' });
  }

  // 验证密码
  if (user.pwd !== password) {
    return res.status(401).json({ error: '手机号或密码错误' });
  }

  // 生成 JWT Token
  const token = jwt.sign({ phoneNumber }, '123', { expiresIn: '1h' });

  return res.json({ message: '登录成功', token, user, code: 200 });
})
//后台注册账号
router.post('/adregister', async (req, res) => {
  let { act, pwd } = req.body
  // 验证请求体
  if (!act || !pwd) {
    return res.status(400).json({ error: '账号和密码不能为空' });
  }

  // 检查用户是否已注册
  const existingUser = await ctrlModel.findOne({ act: act })
  if (existingUser) {
    return res.status(400).json({ error: '账号已注册' });
  }
  await ctrlModel.create({ act: act, pwd: pwd })
  res.send({
    code: 200,
    msg: "reg ok!"
  })
})
//后台登录
router.post("/adlogin", async (req, res) => {
  const { act, pwd } = req.body;
  if (!act || !pwd) {
    return res.status(400).json({ error: '账号和密码不能为空' });
  }

  // 检查用户是否存在
  const user = await ctrlModel.findOne({ act: act })
  if (!user) {
    return res.status(401).json({ error: '账号或密码错误' });
  }

  // 验证密码
  if (user.pwd !== pwd) {
    return res.status(401).json({ error: '账号或密码错误' });
  }

  // 生成 JWT Token
  const token = jwt.sign({ act }, '123', { expiresIn: '1h' });
  return res.json({ message: '登录成功', token, user, code: 200 });
})
//用户授权保存微信用户的昵称，头像性别，等信息
router.post("/saveUserInfo", async (req, res) => {
  let { openid } = req.query
  let { nickName,
    avatarUrl,
    gender } = req.body
  let ugender;
  if (gender === '1') {
    ugender = true
  } else {
    ugender = false
  }
  await userInfoModel.updateOne({ openid: openid }, { name: nickName, avtor: avatarUrl, gender: ugender })
  res.send({
    code: 200
  })
})
// 上传图片
router.post("/upload", (req, res) => {
  // 创建一个表单对象
  let form = new multiparty.Form();
  // 设计图片上传路径
  form.uploadDir = 'upload';

  // 解析form对象
  form.parse(req, async (err, file, data) => {
    if (err) {
      return res.status(500).json({ code: 500, msg: '表单解析失败', error: err.message });
    }

    if (!data.file || data.file.length === 0) {
      return res.status(400).json({ code: 400, msg: '未上传文件' });
    }

    try {
      let imgSrc = data.file[0].path;
      let imgpath = imgSrc.replace(/\\/g, "/"); // 统一路径分隔符

      // 压缩图片为webp格式
      const sharp = require('sharp');
      console.log(imgpath)
      const compressedImgPath = imgpath.replace(/(\.\w+)$/, '.webp');

      await sharp(imgpath)
        .resize(800) // 调整图片大小
        .toFile(compressedImgPath);

      res.status(200).send({
        code: 200,
        msg: "图片上传并压缩成功",
        path: compressedImgPath
      });
    } catch (error) {
      res.status(500).json({ code: 500, msg: '图片压缩失败', error: error.message });
    }
  });
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
    const filePath = path.join(__dirname, '../../upload', imgFileName);

    // 删除文件
    fs.unlink(filePath, async (err) => {
      if (err) {
        return res.status(500).send({ message: '文件删除失败', error: err.message });
      }

      // 删除数据库记录
      await carouselModel.deleteOne({ _id: req.params._id });
      res.status(200).send({ code: 200, msg: "删除成功", data });
    });
  } catch (error) {
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
router.post("/addactivityMsg", async (req, res) => {
  let data = await activityMsgModel.find()
  data.forEach(async (item) => {
    await activityMsgModel.updateOne({ _id: item._id }, { isStart: false })
  })
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
  await activityMsgModel.updateOne({ _id: req.query.updid }, req.body)
  res.send({
    code: 200
  })
})
// 更新活动信息状态
router.put("/updateActiveStatus/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    // 查找活动并获取当前的 isStart 状态
    const activity = await activityMsgModel.findById(_id);

    if (!activity) {
      return res.status(404).send({ code: 404, msg: "活动未找到" });
    }

    // 取反 isStart 字段
    const newStatus = !activity.isStart;

    // 更新指定活动的 isStart 字段
    const result = await activityMsgModel.updateOne({ _id }, { isStart: newStatus });

    if (result.nModified === 0) {
      return res.status(404).send({ code: 404, msg: "活动未修改" });
    }

    res.status(200).send({ code: 200, msg: "更新成功" });
  } catch (err) {
    res.status(500).send({ code: 500, msg: "更新失败", err });
  }
});


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
//删除
// router.delete("/deluser/:userid", async (req, res) => {
//   let { userid } = req.params
//   console.log(userid)
//   await userInfoModel.deleteOne({ _id: userid })
//   res.send({
//     code: 200
//   })
// })
router.delete("/deluser/:userid", async (req, res) => {
  let { userid } = req.params;
  console.log(userid);

  try {
    // 删除 userInfoModel 中的记录
    await userInfoModel.deleteOne({ _id: userid });

    // 删除 aftdoorModel 中 apid 为 userid 的记录
    await aftdoorModel.deleteMany({ apid: userid });

    // 删除 voteModel 中 actvoter 为 userid 的记录
    await voteModel.deleteMany({ actvoter: userid });

    // 返回成功响应
    res.send({
      code: 200,
      message: "User and related data deleted successfully"
    });
  } catch (error) {
    // 错误处理
    console.error(error);
    res.status(500).send({
      code: 500,
      message: "删除错误"
    });
  }
});

//获取所有用户
router.get("/getuser", async (req, res) => {
  let { nowPage = 1, pageSize = 6, positionid, searchcontent } = req.query;

  // 调用函数修改选手票数
  let idArr = await userInfoModel.find().lean(); // 无分页，判断是否报名
  let ids = idArr.filter(item => item.isApply).map(i => i._id);

  let pieline = [
    {
      $match: {
        isApply: true
      }
    },
    {
      $lookup: {
        localField: "position",
        foreignField: "_id",
        from: "position",
        as: "position"
      }
    },
  ];

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

  // 添加排序：先显示 isAudit 为 true 的，后显示 false 的
  pieline.push({
    $sort: {
      isAudit: 1, // -1 为降序，即先显示 true 的
      mark: 1 // 1 为升序，即先显示 mark 小的
    }
  });
  pieline.push({
    $facet: {
      users: [
        { $skip: (Number(nowPage) - 1) * Number(pageSize) },
        { $limit: Number(pageSize) }
      ],
      totalCount: [
        { $count: "count" }
      ]
    }
  })
  // pieline.push({
  //   $skip: (nowPage - 1) * pageSize
  // });

  // pieline.push({
  //   $limit: Number(pageSize)
  // });

  let result = await userInfoModel.aggregate(pieline);
  // let userstotal = await userInfoModel.find({ isApply: true }).countDocuments();
  const users = result[0].users;
  const userstotal = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
  res.send({
    code: 200,
    users: users,
    userstotal: userstotal,
    ids: ids
  });
});


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
      $skip: (nowPage - 1) * pageSize
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
  try {
    const { _id } = req.body
    let data = await commentModel.findOne({ _id })
    if (data.audit) {
      await commentModel.updateOne({ _id }, { audit: false })
    } else {
      await commentModel.updateOne({ _id }, { audit: true })
    }
    res.status(200).send({ code: 200, msg: "更新成功" })
  } catch (err) {
    res.status(500).send({ code: 500, msg: "更新失败", err })
  }
})

// 更新审核显示状态
router.put("/updateShow", async (req, res) => {
  try {
    const { _id } = req.body
    let data = await commentModel.findOne({ _id })
    if (data.isPass) {
      await commentModel.updateOne({ _id }, { isPass: false })
    } else {
      await commentModel.updateOne({ _id }, { isPass: true })
    }
    res.status(200).send({ code: 200, msg: "更新成功" })
  } catch (err) {
    res.status(500).send({ code: 500, msg: "更新失败", err })
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
    data = data.filter(item => item.isApply)
    let poData = await positionModel.find().lean()
    const poDataMap = poData.reduce((map, po) => {
      map[po._id.toString()] = po.jobTitle; // 将职位ID（po._id）映射到职位名称（po.jobTitle）
      return map;
    }, {});


    data.forEach(item => {
      if (item.position) { // 检查 position 是否存在
        const jobName = poDataMap[item.position.toString()]; // 查找对应职位名称
        if (jobName) {
          item.jobName = jobName;  // 如果找到了职位名称，添加到用户对象
        }
      } else {
        item.jobName = '未知职位'; // 如果 position 不存在，设置默认值
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
    console.log(err)
    res.status(500).send({ code: 500, msg: "获取失败", err })
  }
})

router.get("/getDetail", async (req, res) => {
  try {
    // 获取并处理用户数据，排除票数为0的用户
    let data = await userInfoModel.find({ vote: { $gt: 0 }, isApply: true }).lean(); // 筛选票数大于0且已申请的用户
    data.sort((a, b) => b.vote - a.vote || a.mark - b.mark); // 根据票数降序，票数相同则按 mark 升序

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
      // 只取前10条数据
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
    console.log(err)
    res.status(500).send({ code: 500, msg: "获取失败", err });
  }
});







// 更新富文本
router.put('/changeRichTextMsg', async (req, res) => {
  let { id, content } = req.body;
  try {
    await userInfoModel.updateOne({ _id: id }, { richText: content, isAudit: true });
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
// 修改活动说明图片信息
router.put('/putAcspimgs', async (req, res) => {
  try {
    let { _id, imgsrc, content } = req.body
    await acspeakModel.updateOne({ _id }, { imgsrc, content })
    res.send({ code: 200, msg: "修改成功" })
  } catch (err) {
    res.status(500).json({ code: 500, msg: Error.message })
  }
})

//删除说明活动图片
router.delete("/delacspk", async (req, res) => {
  let { did } = req.query
  await acspeakModel.deleteOne({ _id: did })
  res.send({
    code: 200
  })
})
//获取全部的票数
router.get("/allvotes", async (req, res) => {
  let allactvotes = await voteModel.find().countDocuments()
  let aftdoorvotels = await aftdoorModel.find()
  let allvotes = 0;
  aftdoorvotels.forEach((item) => {
    allactvotes += item.opa
  })
  allvotes = allactvotes
  res.send({
    code: 200,
    allvotes
  })
})
//修改选手的个人票数
router.post("/addaftdoorvote", async (req, res) => {
  aftdoorModel.create(req.body)
  res.send({
    code: 200
  })
})
//修改用户信息
router.post("/upduserinfo", async (req, res) => {
  let { uid } = req.query
  let { name, avtor, introduce, position } = req.body.ruleForm
  let { vote } = req.body
  console.log(req.body);
  await userInfoModel.updateOne({ _id: uid }, { name, avtor, introduce, position})
  await userInfoModel.findOneAndUpdate(
    { _id: uid },
    { $inc: { vote } },
    { new: true }
  );
  res.send({
    code: 200
  })
})


// 后端 API 处理逻辑
router.put('/changeRichTexts', async (req, res) => {
  let { id, data } = req.body;  // 获取前端传来的数据
  try {
    // 转换数据为 Quill 可识别的 HTML 格式
    const richTextHTML = convertToQuillHTML(data);

    // 更新数据库中的 richText 字段
    await userInfoModel.updateOne({ _id: id }, { richText: richTextHTML });

    res.send({
      code: 200,
      msg: "修改成功",
    });
  } catch (err) {
    res.status(500).send({
      code: 500,
      msg: "修改失败",
      err,
    });
  }
});

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
//获取未参赛的所有用户
router.get("/getcomnuser", async (req, res) => {
  let { phone, nowpage = 1, pagesize = 5 } = req.query
  let pile = [
    {
      $match: {
        isApply: false
      }
    }
  ]
  if (phone) {
    pile.push({
      $match: {
        phone: { $regex: phone }
      }
    })
  }
  pile.push({
    $skip: (nowpage - 1) * pagesize
  })
  pile.push(
    {
      $limit: Number(pagesize)
    }
  )
  let comusers = await userInfoModel.aggregate(pile)
  let comuserstotal = await userInfoModel.find({ isApply: false }).countDocuments()
  res.send({
    code: 200,
    comus: comusers,
    comustl: comuserstotal
  })
})

// 简历通过审核
router.put("/passAudit", async (req, res) => {
  try {
    let { _id } = req.body
    await userInfoModel.updateOne({ _id }, { isAudit: true, isApply: true })
    res.status(200).send({ code: 200, msg: "审核成功" })
  } catch (err) {
    res.status(500).send({ code: 500, msg: "审核失败", err })
  }
})
//获取总人数，总票数，总访问量
router.get("/totalrpf", async (req, res) => {
  let rens = await userInfoModel.find({ isApply: true }).countDocuments()
  let votes = await voteModel.find().countDocuments()
  let visitData = await activityMsgModel.find().limit(1); // 获取第一条数据
  let visitNum = visitData[0].visitNum; // 访问第一条数据的 visitNum 字段
  res.send({
    totalr: rens,
    totalv: votes,
    totalt: visitNum
  })
})
//删除dovoter为null的数据
router.get("/delvotenull", async(req, res) => {
  await voteModel.deleteMany({dovoter: null})
  res.send({
    code: 200,
    msg: '已删除'
  })
})
//票数在三千以上的都改为3000其他的不动
router.get('/update-votes', async (req, res) => {
  try {
    // 使用 updateMany 方法更新所有 vote 大于 3000 的文档
    const result = await userInfoModel.updateMany(
      { vote: { $gt: 3000 } }, // 查询条件：vote 大于 3000
      { $set: { vote: 3000 } } // 更新操作：将 vote 设置为 3000
    );

    res.json({
      message: '更新成功',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('更新过程中出现错误:', error);
    res.status(500).json({
      message: '更新失败',
      error: error.message
    });
  }
});
router.get("/delshabi", async(req, res) => {
  try {
    // 使用正则表达式匹配纯数字字符串
    const result = await voteModel.deleteMany({
      dovoter: { $regex: /^\d+$/ } // 匹配全数字字符串
    });

    res.status(200).json({
      code: 200,
      message: `成功删除 ${result.deletedCount} 条记录`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: error.message
    });
  }
})
module.exports = router;