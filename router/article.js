
const express = require('express');
const {dbSelect,dbInsert} = require('../db');

const router = express.Router()

// router.use((req, res, next) => {
//     next()
// })

//展示文章
router.get(`/getArticleList`, (req, res, next) => { 
    // let datas = req.body
    dbSelect({
        table:"article",
        field:['id','article_title', 'article_describe','add_time']
    }).then(data=>{
        res.json({"code": 20000, "message": "成功", "data": data})
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": "失败", "data": "数据库错误!"+err})
    })
})

//添加文章
router.post(`/setArticleAdd`, (req, res, next) => { 
    let body = req.body
    let bodyKeysArr = Object.keys(body);
    let bodyValuesArr = Object.values(body);
    dbInsert({
        table:"article",
        field:bodyKeysArr,
        values:bodyValuesArr
    }).then(data=>{
        res.json({"code": 20000, "message": "成功", "data": data})
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": "失败", "data": "数据库错误!"+err})
    })

    // let sql = `INSERT INTO article (article_title, article_describe,article_content,article_class,article_label,add_time)VALUES (?,?,?,?,?,?)`
    // db.query(sql,[datas.article_title,datas.article_describe,datas.article_content,datas.article_class,datas.article_label,datas.add_time],function (err, data) {
    //     if(!err){         
    //         res.json({"code": 20000, "message": "成功", "data": data})
    //     }else{
    //         console.log(err);
    //         res.json({"code": 401, "message": "失败", "data": "数据库错误!"+err})
    //         return;
    //     }
    // })

})

module.exports = router