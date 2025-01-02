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


const convertToQuillHTML = (data) => {
  let htmlContent = `
    <body><div class="quill-editor-content" style="font-family: Arial, sans-serif; line-height: 1.6; color: #fff; text-align: center; background-color: #333; padding: 20px; border-radius: 8px;">
  `;

  // 添加个人头像
  if (data.profileImage) {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        <img src="${data.profileImage}" alt="Profile Image" style="width: 100%; max-width: 150px; height: auto; border-radius: 50%; border: 2px solid #fff; margin: auto;" />
      </div>
    `;
  }

  // 添加姓名和职位
  htmlContent += `
    <div style="margin-bottom: 10px;">
      <h1 style="font-size: 24px; margin: 0;">${data.name}</h1>
      <p style="font-size: 16px; margin: 5px 0;"><strong>${data.position}</strong></p>
    </div>
  `;

  // 添加年龄和联系方式
  htmlContent += `
    <div style="margin-bottom: 20px;">
      <p><strong>年龄:</strong> ${data.age}</p>
      <p><strong>联系方式:</strong> ${data.contact}</p>
    </div>
  `;

  // 添加简历
  if (data.resume) {
    htmlContent += `
      <div style="margin-bottom: 20px; padding: 10px; text-align: left; font-size: 14px;border-radius: 8px;">
        <p style="margin: 0; white-space: pre-wrap;">${data.resume}</p>
      </div>
    `;
  }

  // 如果有荣誉图片
  if (data.honorImages && data.honorImages.length > 0) {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 18px; color: #fff;">荣誉照片</h3>
        ${data.honorImages
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

  // 如果有人物照片
  if (data.personImages && data.personImages.length > 0) {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 18px; color: #fff;">人物照片</h3>
        ${data.personImages
        .map(
          (imgUrl) => `
              <div style="margin-bottom: 10px;">
                <img src="${imgUrl}" alt="Person Image" style="width: 100%; max-width: 300px; border-radius: 8px; border: 2px solid #fff;" />
              </div>
            `
        )
        .join("")}
      </div>
    `;
  }

  // 添加荣誉证书
  if (data.honorType) {
    htmlContent += `
      <div style="margin-bottom: 20px; color: #ddd;">
        <p><strong>荣誉证书:</strong> ${data.honorType}</p>
      </div>
    `;
  }

  htmlContent += `</div></body>`;
  return htmlContent;
};

// 调用函数并输出 HTML
const data = {
  name: "张三",
  age: 30,
  contact: "123456789",
  gender: "男",
  position: "前端开发工程师",
  resume: "具备5年丰富的前端开发经验，擅长Vue、React、Node.js等技术栈。",
  profileImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s",
  honorImages: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s"],
  personImages: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRKFXnQPm3COQ9nPZiMmbhvfo-sAHvBozV_A&s"],
  honorType: "最佳前端开发奖"
};

const htmlOutput = convertToQuillHTML(data);
console.log(htmlOutput);



module.exports = router;