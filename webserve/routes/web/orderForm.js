var express = require('express');
var router = express.Router();
var {
  orderFormModel,//票数操作库
} = require("../../model/model");

// 查询指定订单
router.get('/getOrder', async (req, res) => {
  try {
    const order = await orderFormModel.findOne({ orderId: req.query.orderId })
    if (!order) {
      return res.status(404).json({ code: 404, msg: '订单未找到' });
    }
    res.json({
      code: 200,
      msg: '订单查询成功',
      data: order
    });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单查询失败', error: err.message });
  }
});


// 查询指定用户的订单
router.get('/getAllOrder', async (req, res) => {
  try {
    let { page = 1, pageSize = 5, sellerId = '' } = req.query
    const orders = await orderFormModel.find({ sellerId }).skip((page - 1) * pageSize).limit(pageSize)
    const total = await orderFormModel.countDocuments({ sellerId: req.query.sellerId })
    res.json({ code: 200, msg: '订单查询成功', data: orders, total })
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单查询失败', error: err });
  }
})

// 删除订单
router.delete('/deleteOrder/:_id', async (req, res) => {
  try {
    let { _id } = req.params

    await orderFormModel.deleteOne({ _id })
    res.status(200).json({ code: 200, msg: '订单删除成功' })
  } catch (err) {
    res.status(500).json({ code: 500, msg: '订单删除失败', error: err });
  }
})

// 查询订单
// router.get("/getOrderInfo", async (req, res) => {
//   try {
//     const {
//       filterType = "", // 筛选类型
//       date = "",       // 日期
//       buyerName = "",  // 买家姓名
//       sellerName = "", // 卖家姓名
//       status = "",     // 状态
//       sort = "desc",   // 排序 (默认降序)
//       page = 1,        // 当前页
//       pageSize = 5     // 每页条数
//     } = req.query;

//     let filters = []; // 查询条件

//     // 日期筛选条件
//     if (date && filterType) {
//       let startDate, endDate;
//       try {
//         if (filterType === "day") {
//           startDate = new Date(date); // 直接使用传入日期作为开始时间
//           endDate = new Date(startDate);
//           endDate.setDate(endDate.getDate() + 1); // 加1天作为结束时间
//         } else if (filterType === "month") {
//           const [year, month] = date.split("-").map(Number);
//           startDate = new Date(year, month - 1, 1); // 当月的第一天
//           endDate = new Date(year, month, 1); // 下个月的第一天
//         } else if (filterType === "year") {
//           const year = parseInt(date, 10);
//           startDate = new Date(year, 0, 1); // 当年的第一天
//           endDate = new Date(year + 1, 0, 1); // 下一年的第一天
//         } else {
//           return res.status(400).json({ code: 400, msg: "Invalid filterType" });
//         }
//       } catch (err) {
//         return res.status(400).json({ code: 400, msg: "Invalid date format" });
//       }
//       console.log("startDate:", startDate, "endDate:", endDate, "filterType:", filterType, "date:", date);
//       filters.push({ created_at: { $gte: startDate, $lt: endDate } });
//     }

//     // 其他筛选条件
//     if (buyerName) filters.push({ buyerName: new RegExp(buyerName, "i") }); // 模糊匹配
//     if (sellerName) filters.push({ sellerName: new RegExp(sellerName, "i") }); // 模糊匹配
//     if (status) filters.push({ status });

//     const query = filters.length > 0 ? { $and: filters } : {}; // 查询条件

//     // 聚合管道：统计用户订单数据
//     const userStatisticsPipeline = [
//       { $match: query }, // 匹配查询条件
//       {
//         $group: {
//           _id: { buyerName: "$buyerName", sellerName: "$sellerName" }, // 分组（买家和卖家姓名）
//           totalAmount: { $sum: "$money" }, // 总金额
//           totalOrders: { $sum: 1 },        // 总订单数
//           successfulOrders: {
//             $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }, // 支付成功订单数
//           },
//         },
//       },
//       {
//         $project: {
//           buyerName: "$_id.buyerName", // 买家姓名
//           sellerName: "$_id.sellerName", // 卖家姓名
//           totalAmount: 1,
//           totalOrders: 1,
//           successRate: {
//             $multiply: [{ $divide: ["$successfulOrders", "$totalOrders"] }, 100], // 支付成功率
//           },
//           avgOrderAmount: {
//             $cond: { if: { $eq: ["$totalOrders", 0] }, then: 0, else: { $divide: ["$totalAmount", "$totalOrders"] } },
//           }, // 平均订单金额
//         },
//       },
//       { $sort: { totalAmount: sort === "asc" ? 1 : -1 } }, // 按总金额排序
//       { $skip: (page - 1) * pageSize }, // 分页跳过
//       { $limit: Number(pageSize) }, // 每页条数
//     ];

//     // 执行聚合管道
//     const userStatistics = await orderFormModel.aggregate(userStatisticsPipeline);

//     // 统计总记录数
//     const totalRecordsPipeline = [
//       { $match: query },
//       {
//         $group: {
//           _id: { buyerName: "$buyerName", sellerName: "$sellerName" },
//         },
//       },
//       { $count: "total" },
//     ];

//     const totalResult = await orderFormModel.aggregate(totalRecordsPipeline);
//     const total = totalResult.length > 0 ? totalResult[0].total : 0;

//     res.status(200).json({
//       code: 200,
//       msg: "查询成功",
//       total, // 总记录数
//       userStatistics, // 用户统计数据
//     });
//   } catch (err) {
//     console.error("Error occurred in /getOrderInfo:", err.message, err.stack);
//     res.status(500).json({
//       code: 500,
//       msg: "查询失败",
//       error: err.message,
//     });
//   }
// });

router.get("/getOrderInfo", async (req, res) => {
  try {
    const {
      filterType = "", // 筛选类型
      date = "",       // 日期
      buyerName = "",  // 买家姓名
      sellerName = "", // 卖家姓名
      status = "",     // 状态
      sort = "desc",   // 排序 (默认降序)
      page = 1,        // 当前页
      pageSize = 5     // 每页条数
    } = req.query;

    let filters = []; // 查询条件

    // 日期筛选条件
    if (date && filterType) {
      let startDate, endDate;
      try {
        if (filterType === "day") {
          startDate = new Date(date); // 开始时间为传入日期
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1); // 结束时间为下一天
        } else if (filterType === "month") {
          const [year, month] = date.split("-").map(Number);
          startDate = new Date(year, month - 1, 1); // 当月第一天
          endDate = new Date(year, month, 1); // 下个月第一天
        } else if (filterType === "year") {
          const year = parseInt(date, 10);
          startDate = new Date(year, 0, 1); // 当前年份第一天
          endDate = new Date(year + 1, 0, 1); // 下一年份第一天
        } else {
          return res.status(400).json({ code: 400, msg: "Invalid filterType" });
        }
      } catch (err) {
        return res.status(400).json({ code: 400, msg: "Invalid date format" });
      }
      filters.push({ created_at: { $gte: startDate, $lt: endDate } });
    }

    // 其他筛选条件
    if (buyerName) {
      try {
        filters.push({ buyerName: new RegExp(buyerName, "i") }); // 模糊搜索买家姓名
      } catch (err) {
        return res.status(400).json({ code: 400, msg: "Invalid buyerName format" });
      }
    }
    if (sellerName) {
      try {
        filters.push({ sellerName: new RegExp(sellerName, "i") }); // 模糊搜索卖家姓名
      } catch (err) {
        return res.status(400).json({ code: 400, msg: "Invalid sellerName format" });
      }
    }
    if (status) filters.push({ status });

    const query = filters.length > 0 ? { $and: filters } : {}; // 查询条件

    // 聚合管道：统计用户订单数据
    const userStatisticsPipeline = [
      { $match: query }, // 匹配查询条件
      {
        $group: {
          _id: { buyerName: "$buyerName", sellerName: "$sellerName" }, // 分组（买家和卖家姓名）
          totalAmount: { $sum: "$money" }, // 总金额
          totalOrders: { $sum: 1 },        // 总订单数
          successfulOrders: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }, // 支付成功订单数
          },
        },
      },
      {
        $project: {
          buyerName: "$_id.buyerName", // 买家姓名
          sellerName: "$_id.sellerName", // 卖家姓名
          totalAmount: 1,
          totalOrders: 1,
          successRate: {
            $multiply: [{ $divide: ["$successfulOrders", "$totalOrders"] }, 100], // 支付成功率
          },
          avgOrderAmount: {
            $cond: { if: { $eq: ["$totalOrders", 0] }, then: 0, else: { $divide: ["$totalAmount", "$totalOrders"] } },
          }, // 平均订单金额
        },
      },
      { $sort: { totalAmount: sort === "asc" ? 1 : -1 } }, // 按总金额排序
      { $skip: (Math.max(parseInt(page), 1) - 1) * Math.max(parseInt(pageSize), 1) }, // 分页跳过
      { $limit: Math.max(parseInt(pageSize), 1) }, // 每页条数
    ];

    // 执行聚合管道
    const userStatistics = await orderFormModel.aggregate(userStatisticsPipeline);

    // 统计总记录数
    const totalRecordsPipeline = [
      { $match: query },
      {
        $group: {
          _id: { buyerName: "$buyerName", sellerName: "$sellerName" },
        },
      },
      { $count: "total" },
    ];

    const totalResult = await orderFormModel.aggregate(totalRecordsPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.status(200).json({
      code: 200,
      msg: "查询成功",
      total, // 总记录数
      userStatistics, // 用户统计数据
    });
  } catch (err) {
    console.error("Error occurred in /getOrderInfo:", err.message, err.stack);
    res.status(500).json({
      code: 500,
      msg: "查询失败",
      error: err.message,
    });
  }
});
//删除一块钱以下的订单记录
// 定义删除路由
router.get('/delete-orders', async (req, res) => {
  try {
      // 使用 deleteMany 方法删除所有 money 小于 1 的文档
      const result = await orderFormModel.deleteMany({ money: { $lt: 1 } });

      res.json({
          message: '删除成功',
          deletedCount: result.deletedCount
      });
  } catch (error) {
      console.error('删除过程中出现错误:', error);
      res.status(500).json({
          message: '删除失败',
          error: error.message
      });
  }
});
module.exports = router;