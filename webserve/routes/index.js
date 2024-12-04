var express = require('express');
var router = express.Router();
var { carouselModel, activityMsgModel, positionModel } = require("../model/model")
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
      console.log(imgpath);
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

module.exports = router;
