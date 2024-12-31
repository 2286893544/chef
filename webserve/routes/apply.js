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
const { wxPay } = require('../utils/jsSDK');  // 引入jsSDK中的wxPay方法

// 获取职位信息
router.get("/getPosition", async (req, res) => {
  try {
    let position = await positionModel.find();
    res.json({ code: 200, data: position })
  } catch (err) {
    res.json({ code: 500, msg: "服务器错误" })
  }
})

// 报名  -- 测试中
router.post("/apply", async (req, res) => {
  try {
    let { name, age, contact, gender, position, resume, profileImage, additionalImages } = req.body;
    // const data = convertToQuillHTML(req.body);

  } catch (err) {
    res.json({ code: 500, msg: "服务器错误" })
  }
})

// 模拟数据
const data = {
  name: "张三",
  age: 30,
  contact: "123456789",
  gender: "男",
  position: "前端工程师",
  resumeText: "拥有5年开发经验，熟悉React和Vue。擅长组件开发、性能优化，热爱开源。",
  label: "认真负责, 团队合作, 创新精神",
  cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s", // 模拟封面图片
  additionalImages: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQqlGa6l0K84mRAqdeQ6dRDIEfLE8Ai_iMYg&s", // 模拟荣誉图片1
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s", // 模拟荣誉图片2
  ],
};

// 报名信息数据处理
const convertToQuillHTML = (data) => {
  let htmlContent = `
    <body><div class="quill-editor-content" style="font-family: Arial, sans-serif; line-height: 1.6; color: #fff; text-align: center; background-color: #333; padding: 20px; border-radius: 8px;">
  `;

  // 添加封面图片
  if (data.cover) {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        <img src="${data.cover}" alt="Cover Image" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; border: 2px solid #fff; margin: auto;" />
      </div>
    `;
  }

  // 添加姓名和职位
  htmlContent += `
    <div style="margin-bottom: 10px; color: #fff;">
      <h1 style="font-size: 20px; margin: 0;">${data.name}</h1>
      <p style="font-size: 14px; color: #ddd; margin: 5px 0;"><strong>${data.position}</strong></p>
    </div>
  `;

  // 添加简历文本
  if (data.resumeText) {
    htmlContent += `
      <div style="margin-bottom: 20px; color: #ddd; padding: 10px; text-align: left; font-size: 14px; background: #444; border-radius: 8px;">
        <p style="margin: 0; white-space: pre-wrap;">${data.resumeText}</p>
      </div>
    `;
  }

  // 如果有荣誉图片
  if (data.additionalImages && data.additionalImages.length > 0) {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        ${data.additionalImages
        .map(
          (imgUrl) => `
              <div style="margin-bottom: 10px;">
                <img src="${imgUrl}" alt="Honor Image" style="width: 100%; max-width: 300px; border-radius: 8px; border: 2px solid #fff;" />
              </div>
            `
        )
        .join("")}
      </div>
    `;
  }

  htmlContent += `</div></body>`;
  return htmlContent;
};



// 调用函数并输出 HTML
const htmlOutput = convertToQuillHTML(data);


module.exports = router;