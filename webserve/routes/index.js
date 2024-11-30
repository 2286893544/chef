var express = require('express');
var router = express.Router();
var { carouselModel } = require("../model/model")
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
      console.log(imgSrc)
      res.status(200).send({
        code: 200,
        msg: "图片上传成功",
        path: data.file[0].path
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
  let { page, pageSize } = req.query
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

module.exports = router;
