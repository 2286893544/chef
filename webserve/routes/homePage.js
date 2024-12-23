var express = require('express');
var router = express.Router();
var {
  carouselModel,  //  轮播图
  activityMsgModel, //  活动信息
  positionModel,  //  职位
  userInfoModel,//用户
  commentModel,//留言板
} = require("../model/model");
//获取所有首页选手
router.get("/getaplyuser", async (req, res) => {
  let { nowPage = 1, pageSize = 6, positionid, searchcontent, fsc } = req.query

  let idArr = await userInfoModel.find().lean() //无分页，判断是否报名
  let ids = idArr.filter(item => item.isCheck).map(i => i._id)
  let pieline = [
    {
      $lookup: {
        localField: "position",
        foreignField: "_id",
        from: "position",
        as: "position"
      }
    },

  ];
  if (fsc == 'hot') {
    pieline.push(
      {
        $sort: {
          vote: -1
        }
      }
    )
  }
  if (fsc == 'new') {
    pieline.push(
      {
        $sort: {
          addTime: -1
        }
      }
    )
  }
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
  pieline.push({
    $skip: (nowPage - 1) * pageSize
  })
  pieline.push(
    {
      $limit: Number(pageSize)
    }
  )
  let users = await userInfoModel.aggregate(pieline)
  let userstotal = await userInfoModel.countDocuments()
  res.send({
    code: 200,
    users: users,
    userstotal: userstotal,
    ids: ids
  })
})


module.exports = router;