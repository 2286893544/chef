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
    let { _id, name, position, profileImage, introduce } = req.body;

    // 确保 _id 是 ObjectId 类型
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.json({ code: 400, msg: "无效的用户 ID" });
    }

    // 检查是否传递了必要的字段
    if (!name) {
      return res.json({ code: 400, msg: "请输入姓名" });
    }
    if (!position) {
      return res.json({ code: 400, msg: "请选择职位" });
    }
    if (!profileImage) {
      return res.json({ code: 400, msg: "请上传头像" });
    }
    if (!introduce) {
      return res.json({ code: 400, msg: "请输入个人介绍" });
    }

    // 更新数据库
    const result = await userInfoModel.updateOne(
      { _id },
      {
        name,
        position,
        avtor: profileImage,
        introduce,
        isApply: true,
        isAudit: false
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



module.exports = router;