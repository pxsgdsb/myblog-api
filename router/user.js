const express = require('express');
const {dbSelect} = require('../db');

const router = express.Router()

// router.use((req, res, next) => {
//   next()
// })

//登录请求 判断账号密码 返回token
router.post(`/Login`, (req, res, next) => {
  res.json({
    code: 20000,
    data: {
      roles:"admin",
      introduction:"我是一个管理员",
      avatar:"https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
      name:"px",
      token:"admin-token"
    },
  })
})

//登录请求 验证token
router.get(`/Info`, (req, res, next) => {
  res.json({"code":20000,"data":{"roles":["admin"],"introduction":"I am a super administrator","avatar":"https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif","name":"px"}})
})

//退出登录
router.post(`/Logout`, (req, res, next) => {
  res.json({"code":20000,"data":"success"})
})

router.get(`/Table`, (req, res, next) => {
  res.json({"code":20000,"data":[
    {},
  ]})
})

module.exports = router