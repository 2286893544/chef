import Mock from "mockjs";

const dataTemplate = {
  'mockCarousel|5': [{
    "_id|": "@id()",
    "imgPath": "/image/1.jpg",
    "addTime": "@date('yyyy-MM-dd HH:mm:ss')",
    "isDelete": true
  }]
}

export const { mockCarousel } = Mock.mock(dataTemplate)