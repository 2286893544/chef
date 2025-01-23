const express = require('express');
const router = express.Router();
const multer = require('multer');  // 引入 multer 用于处理文件上传
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');  // 引入 xlsx 库来解析 Excel 文件
const { userInfoModel, positionModel } = require('../../model/model');  // 引入 MongoDB 模型
const multiparty = require('multiparty');
const sharp = require('sharp');  // 引入 sharp 库进行图片处理

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
  const baseUrl = `https://zcgjcy.com/api/img/`;

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
    });

    for (const data of jsonData) {
      const existingUser = await userInfoModel.findOne({ name: data.姓名, avtor: baseUrl + data.图片 });
      if (existingUser) {
        // 如果用户已存在，更新用户信息
        existingUser.introduce = data.简介;
        existingUser.position = data.position;
        existingUser.isApply = true;
        existingUser.isAudit = true;
        await existingUser.save();
      } else {
        // 如果用户不存在，创建新用户
        const newUser = new userInfoModel({
          name: data.姓名,
          introduce: data.简介,
          position: data.position,
          avtor: baseUrl + data.图片,
          isApply: true,
          isAudit: true
        });
        await newUser.save(); // 触发 pre('save') 钩子
      }
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

// 上传图片并压缩
router.post('/uploadImage', async (req, res) => {
  const form = new multiparty.Form({
    maxFilesSize: 5000 * 1024 * 1024, // 允许最大文件大小 20MB
    uploadDir: uploadDir, // 设置文件上传目录
    timeout: 600000, // 设置超时为10分钟
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('文件上传失败:', err);
      return res.status(500).send({ code: 500, message: '文件上传失败' });
    }

    console.log('接收到的文件:', files.files); // 添加日志

    if (!files.files || files.files.length === 0) {
      return res.status(400).send({ code: 400, message: '未上传文件' });
    }

    const uploadedFiles = files.files.map(file => {
      const originalFileName = file.originalFilename; // 获取原始文件名

      try {
        // 压缩图片并转换为 webp 格式
        return compressImage(file.path, originalFileName);
      } catch (fileError) {
        console.error('处理文件时出错:', fileError);
        return Promise.reject(fileError); // 确保返回 Promise
      }
    });

    Promise.all(uploadedFiles).then(results => {
      res.status(200).send({
        code: 200,
        msg: '图片上传并压缩成功',
        data: results, // 返回上传的文件信息
      });
    }).catch(err => {
      console.error('文件处理失败:', err);
      res.status(500).send({ code: 500, message: '文件处理失败', error: err.message });
    });
  });
});

// 图片压缩函数
function compressImage(filePath, originalFileName) {
  console.log('开始压缩图片:', originalFileName, filePath);
  const webpFileName = originalFileName.replace(path.extname(originalFileName), '.webp'); // 将文件扩展名替换为 .webp
  const webpPath = path.join(uploadDir, webpFileName);

  return sharp(filePath)
    .toFormat('webp') // 转换为 webp 格式
    .toBuffer()
    .then((buffer) => {
      try {
        // 将压缩后的图片写回文件
        fs.writeFileSync(webpPath, buffer);
        console.log('图片压缩并保存成功:', webpPath);
        return {
          originalName: originalFileName,
          path: webpPath,
        };
      } catch (writeErr) {
        console.error('写入文件时出错:', writeErr);
        throw writeErr;
      }
    })
    .catch((err) => {
      console.error('图片压缩失败:', err);
      throw err;
    });
}

module.exports = router;
