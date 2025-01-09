var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  voteModel,//投票信息
  commentModel,//留言板
  acspeakModel,//活动说明页
  aftdoorModel,//票数操作库
} = require("../../model/model");

// 获取职位信息
router.get("/getPosition", async (req, res) => {
  try {
    let position = await positionModel.find();
    res.json({ code: 200, data: position })
  } catch (err) {
    res.json({ code: 500, msg: "服务器错误" })
  }
})

// 报名
router.put("/addApply", async (req, res) => {
  try {
    let { _id, name, age, contact, gender, position, profileImage } = req.body;

    // 确保 _id 是 ObjectId 类型
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.json({ code: 400, msg: "无效的用户 ID" });
    }

    const posId = await positionModel.findOne({ _id: position });

    // 转换富文本为 HTML
    const data = convertToQuillHTML(req.body, posId.jobTitle);

    // 检查是否传递了必要的字段
    if (!name || !age || !contact || !gender || !position) {
      return res.json({ code: 400, msg: "所有字段都必须填写" });
    }

    // 更新数据库
    const result = await userInfoModel.updateOne(
      { _id },
      {
        name,
        age,
        phone: contact, // 确保字段名一致
        gender,
        position,
        richText: data,
        cover: profileImage,
        isApply: false,
        isAudit: true
      }
    );

    if (result.nModified === 0) {
      return res.json({ code: 404, msg: "未找到用户或没有更改" });
    }
    res.json({ code: 200, msg: "报名成功，请等待管理员审核" });
  } catch (err) {
    console.error("Error during update:", err);  // 打印详细的错误信息
    res.json({ code: 500, msg: "服务器错误" });
  }
});


const convertToQuillHTML = (data, jobName) => {
  let htmlContent = `
    <head></head><body><div class="quill-editor-content" style="font-family: Arial, sans-serif; line-height: 1.6; text-align: center; padding: 20px; border-radius: 8px;">
  `;

  // 添加个人头像
  if (data.profileImage) {
    htmlContent += `
      <div style="width:90%; margin:0 auto; margin-bottom: 20px;">
        <img src="${data.profileImage}" alt="Profile Image" style="max-width: 50%; height: auto;" margin: auto;" />
      </div>
    `;
  }

  // 添加姓名和职位
  htmlContent += `
    <div style="width:90%; margin:0 auto; margin-bottom: 10px;">
      <h1 style="font-size: 24px; margin: 0;">${data.name}</h1>
      <p style="font-size: 16px; margin: 5px 0;"><strong>${jobName}</strong></p>
    </div>
  `;

  // 添加简历
  if (data.resume) {
    htmlContent += `
      <div style="width:90%; margin:0 auto; margin-bottom: 20px; padding: 10px; text-align: left; font-size: 14px;border-radius: 8px;">
        <p style="margin: 0; white-space: pre-wrap;">${data.resume}</p>
      </div>
    `;
  }

  // 如果有人物照片
  if (data.personImages && data.personImages.length > 0) {
    htmlContent += `
        <div style="width:90%; margin:0 auto; margin-bottom: 20px;">
          ${data.personImages
        .map(
          (imgUrl) => `
                <div style="margin-bottom: 10px;">
                  <img src="${imgUrl}" alt="Person Image" style="max-width: 50%; height: auto;" margin: auto;" />
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
        <div style="width:90%; margin:0 auto; margin-bottom: 20px;">
          <p><strong></strong> ${data.honorType}</p>
        </div>
      `;
  }

  // 如果有荣誉图片
  if (data.honorImages && data.honorImages.length > 0) {
    htmlContent += `
      <div style="width:90%; margin:0 auto; margin-bottom: 20px;">
        ${data.honorImages.map(
      (imgUrl) => `
              <div style="width:90%; margin:0 auto; margin-bottom: 10px;">
                <img src="${imgUrl}" alt="Honor Image" style="max-width: 50%; height: auto;" margin: auto;" />
              </div>
            `
    ).join("")}
      </div>
    `;
  }

  htmlContent += `</div></body>`;
  return htmlContent;
};



module.exports = router;