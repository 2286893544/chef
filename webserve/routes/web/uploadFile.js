const express = require('express');
const router = express.Router();
const multer = require('multer');  // 引入 multer 用于处理文件上传
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');  // 引入 xlsx 库来解析 Excel 文件
const { userInfoModel, positionModel } = require('../../model/model');  // 引入 MongoDB 模型
const multiparty = require('multiparty');
// 配置 multer 中间件，用于处理文件上传
const uploadDir = path.join(__dirname, '../../images'); // 设置上传文件的存储路径
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // 如果目录不存在，创建上传目录
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // 设置文件存储路径为 uploads 目录
  },
  filename: (req, file, cb) => {
    // 设置上传文件的文件名为当前时间戳 + 原始文件名
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// 初始化 multer
const upload = multer({ storage });

// 处理文件上传并解析的 POST 接口
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: '没有上传文件' });
  }

  const filePath = req.file.path;

  // 获取环境变量，构建图片 URL 地址
  const htp = 'http';
  const host = 'zcgjcy.com/api';  // 默认为 127.0.0.1
  const baseUrl = `${htp}://${host}/img/`;

  try {
    // 使用 xlsx 解析文件
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet); // 将 Excel 转换为 JSON 数据

    let positionList = await positionModel.find(); // 查询所有职位信息
    jsonData.forEach((item) => {
      // 根据职位名称查找职位ID
      const position = positionList.find((p) => p.jobTitle === item.职位);
      if (position) {
        item.position = position._id; // 将职位ID添加到数据中
      }
    })

    for (const data of jsonData) {
      const newUser = new userInfoModel({
        name: data.姓名,
        introduce: data.简介,
        position: data.position,
        avtor: baseUrl + data.图片,
        isApply: true,
        isAudit: false
      });
      await newUser.save(); // 触发 pre('save') 钩子
    }
    console.log('批量保存用户成功！');

    // 响应客户端
    res.status(200).send({
      code: 200,
      message: '文件上传并解析成功',
      data: jsonData, // 返回解析后的数据
    });
  } catch (error) {
    console.error('解析 Excel 文件时出错:', error);
    res.status(500).send({
      message: '文件解析失败',
      error: error.message,
    });
  } finally {
    // 删除上传的临时文件
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('删除 Excel 文件时出错:', err);
      } else {
        console.log('Excel 文件删除成功');
      }
    });
  }
});




// 上传图片
router.post('/uploadImage', async (req, res) => {
  const form = new multiparty.Form();
  form.uploadDir = uploadDir; // 设置文件上传路径

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('文件上传失败:', err);
      return res.status(500).send({ code: 500, message: '文件上传失败' });
    }

    if (!files.files || files.files.length === 0) {
      return res.status(400).send({ code: 400, message: '未上传文件' });
    }

    console.log(files.files)
    const uploadedFiles = files.files.map(file => {
      const originalFileName = file.originalFilename; // 获取原始文件名
      const newFilePath = path.join(uploadDir, originalFileName); // 使用原始文件名作为保存的文件名

      // 重命名文件
      fs.renameSync(file.path, newFilePath);

      return {
        originalName: originalFileName,
        path: newFilePath,
      };
    });

    res.status(200).send({
      code: 200,
      msg: '图片上传成功',
      data: uploadedFiles, // 返回上传的文件信息
    });
  });
});

module.exports = router;