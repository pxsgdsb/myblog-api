
const express = require('express');
const {dbSelect,dbInsert,setMd,deleteFile,dbDelete,dbUpdate} = require('../db');
const fs = require('fs');
//图片上传 中间件
const multipart = require('connect-multiparty');
let multipartMiddleware = multipart();

const router = express.Router()

//展示文章
router.post(`/getArticleList`, (req, res, next) => { 
    let body = req.body
    dbSelect({
        table:"article",
        field:["*"],
        limit:`${(body.page-1)*body.pageSize},${body.pageSize}`
    }).then(data=>{
        let PromiseArr = []
        for (let item of data) {
            item["add_time"]=getDateTime(item["add_time"])
            let clItem = new Promise((resolve, reject) => {
                dbSelect({ table:"class",field:["class_name"],where:{"id":item["class_id"]}}).then(className=>{
                    item["class_name"]=className[0]["class_name"]
                    let pxsql = `SELECT label_name FROM label WHERE FIND_IN_SET(id,'${item["label_id"]}')`
                    dbSelect(null,pxsql).then(labelName=>{
                        item["label_name"]=Object.values(labelName)
                        resolve(item)
                    })
                })
            }) 
            PromiseArr.push(clItem)
        }
        Promise.all(PromiseArr).then(data => {
            dbSelect({table:"article",field:["COUNT(id)"]}).then(count=>{
                // console.log(count);
                res.json({"code": 20000, "message": "请求成功", "data": data,"count":count[0]["COUNT(id)"]})
            })
        }).catch(err=>{
            res.json({"code": 401, "message": err, "data": "错误"})
        });
        
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": "数据库错误"+err, "data": ""})
    })
})

//添加文章
router.post(`/setArticleAdd`, (req, res, next) => { 
    let body = req.body
    if(body.id){
        //编辑
        dbUpdate({
            table:"article",
            field:{"article_title":body.article_title,"article_describe":body.article_describe,"class_id":body.class_id,"label_id":body.label_id},
            where:{"id":body.id}
        }).then(result=>{
            return result
        },(err)=>{
            console.log('错误',err);
            res.json({"code": 401, "message": "数据库错误："+err, "data":""})
        }).then(result=>{
            setMd(body.article_title,body.article_content).then(url=>{
                res.json({"code": 0, "message": "编辑成功", "data":""})
            },(err)=>{
                console.log('错误',err);
                res.json({"code": 401, "message": "编辑失败："+err, "data":""})
            })
        })
        return
    }
    //添加
    body['add_time']=Math.floor(Date.now() / 1000)
    dbSelect({
        table:"article",
        field:["*"],
        where:{"article_title":body.article_title}
    }).then(result=>{
        // console.log(result);
        return result
    },(err)=>{
        console.log('错误',err);
        res.json({"code": 401, "message": "数据库错误"+err, "data":""})
    }).then(result=>{
        if (result.length==0){
            setMd(body.article_title,body.article_content).then(url=>{
                // console.log(url);
                body["article_content_url"]=url;
                delete body['article_content']
                return body
            }).then(data=>{
                let bodyKeysArr = Object.keys(data);
                let bodyValuesArr = Object.values(data);
                dbInsert({
                    table:"article",
                    field:bodyKeysArr,
                    values:bodyValuesArr
                }).then(data=>{
                    res.json({"code": 0, "message": "添加成功", "data": "ok"})
                },(err) => {
                    console.log('错误',err);
                    res.json({"code": 401, "message": "数据库错误"+err, "data":""})
                })
            })
        }else{
            res.json({"code": 401, "message": "标题重复", "data":""})
        }
    })
    

})
// 删除文章
router.post(`/DeletArticle`, (req, res, next) => {
    let body = req.body
    let PromiseArr=[];
    //删除数据
    let deleteList = new Promise((resolve, reject) => {
        dbDelete({
            table:"article",
            where:{"id":body.id}
        }).then(res=>{
            resolve("删除成功")
        },(err) => {
            reject(err)
        })
    }) 
    PromiseArr.push(deleteList)
    //删除md文件
    let deleteMd = new Promise((resolve, reject) => {
        let url = "./myArticle/"
        let name = body.article_title
        deleteFile(url,name).then(data=>{
            resolve("删除成功")
        },(err) => {
            reject(err)
        })
    }) 
    PromiseArr.push(deleteMd)
    Promise.all(PromiseArr).then(data => {
        res.json({"code": 0, "message": "删除成功!", "data": "ok"})
    }).catch(err=>{
        console.log('错误',err);
        res.json({"code": 401, "message": "删除错误"+err, "data":""})
    });
})

//编辑文章
router.post(`/EditorArticle`, (req, res, next) => {
    let body = req.body
    dbSelect({
        table:"article",
        field:["article_content_url","class_id","label_id"],
        where:{"id":body.id}
    }).then(data=>{
        let word = fs.readFileSync(data[0]["article_content_url"], 'utf8')
        let class_id = data[0]["class_id"]
        let label_id = data[0]["label_id"]
        res.json({"code": 20000, "message": "获取数据成功", "data":{word,class_id,label_id}})
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": "数据库错误"+err, "data": ""})
    })
})

//添加分类
router.post(`/AddClass`, (req, res, next) => { 
    let body = req.body
    dbSelect({
        table:"class",
        field:['*'],
        where:{"class_name":body.myclass}
    }).then(data =>{
        return data
    }).then(data =>{
        if(data.length==0){
            dbInsert({
                table:"class",
                field:["class_name"],
                values:[body.myclass]
            }).then(data=>{
                res.json({"code": 0, "message": "分类添加成功!", "data": "ok"})
            },(err) => {
                console.log('错误',err);
                res.json({"code": 401, "message": "数据库错误"+err, "data": ""})
            })
        }else{
            res.json({"code": 401, "message": "该分类已存在：" + body.myclass, "data": "错误"})
        }
    })
})

//添加标签
router.post(`/AddLabel`, (req, res, next) => { 
    let body = req.body
    let PromiseArr=[];
    for (let item of body.mylabel) {
        let cx = new Promise((resolve, reject) => {
            dbSelect({
                table:"label",
                field:['*'],
                where:{"label_name":item}
            }).then(data =>{
                if(data.length==0){
                    resolve("该标签不存在："+item)
                }else{
                    reject("该标签已存在："+item)
                }
            })
        }) 
        PromiseArr.push(cx)
    }
    //判断标签都是否存在
    Promise.all(PromiseArr).then(data => {
        dbInsert({
            table:"label",
            field:["label_name"],
            values:[body.mylabel]
        }).then(data=>{
            res.json({"code": 0, "message": "标签添加成功!", "data": "ok"})
        },(err) => {
            console.log('错误',err);
            res.json({"code": 401, "message": "数据库错误"+err, "data": ""})
        })
    }).catch(err=>{
        // 有标签存在
        res.json({"code": 401, "message": err, "data": "错误"})
    });
})

// 展示分类
router.get(`/getClassList`, (req, res, next) => { 
    dbSelect({
        table:"class",
        field:['id','class_name']
    }).then(data=>{
        res.json({"code": 20000, "message": "请求成功", "data": data})
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": "数据库错误"+err, "data":""})
    })
})

// 展示分类
router.get(`/getLabelList`, (req, res, next) => { 
    dbSelect({
        table:"label",
        field:['id','label_name']
    }).then(data=>{
        res.json({"code": 20000, "message": "请求成功", "data": data})
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": "数据库错误"+err, "data":""})
    })
})

//图片上传
router.post('/upload', multipartMiddleware, function (req, res) {　　
    let type = req.files.image.type.split("/")[1]
    let size = req.files.image.size;
    var maxSize = 800 * 1024;     //800K
    if (size > maxSize) {
        res.json({"code": 401, "message": "图片大小不能超过800K", "data":""});
        return;
    }
    fs.readFile(req.files.image.path, function (err, data) {
        if(err) {
            res.json({"code": 401, "message": "图片上传失败", "data":""});
            return;
        }
        var base64str = Buffer.from(data).toString('base64'); //图片转字节
        fs.writeFileSync("./public/upload/" + Date.parse(new Date()) + "." + type, base64str, 'base64');  //    写入本地
        res.json({"code": 0, "message": "上传成功！", "data": "http://127.0.0.1:3000/upload/" + Date.parse(new Date()) + "." + type});
    });
    
})

//删除图片
router.post('/deleteFile', function (req, res) {
    let body = req.body;
    let url = body.type=="image" ? "./public/upload/" : "./myArticle/";
    let name = body.name;
    deleteFile(url,name).then(data=>{
        // console.log(data);
        res.json({"code": 0, "message": data, "data":""})
    },(err) => {
        console.log('错误',err);
        res.json({"code": 401, "message": err, "data":""})
    })

});

//时间戳格式化
function getDateTime(value) {
    let time = new Date(value*1000);
    let year = time.getFullYear()+'/';
    let month = (time.getMonth()+1);
    let date = time.getDate();
    let hour = time.getHours();
    let minute = time.getMinutes();
    let second = time.getSeconds();
    month = month < 10 ? '0'+ month +'/' : month +'/';
    date = date < 10 ? '0'+ date : date;
    hour = hour < 10 ? '0'+ hour + ":" : hour + ":";
    minute = minute < 10 ? '0'+ minute : minute + ":";
    second = second < 10 ? '0'+ second : second;
    let str = String(year)+String(month)+String(date)+ ' ' + String(hour) + String(minute) + String(second);
    return str;
}
module.exports = router