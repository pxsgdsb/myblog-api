const express = require('express');
const app = express();
const path = require('path')
const bodyParser = require('body-parser')
const user = require('./router/user')  //  引入路由 user
const article = require('./router/article')  //  引入路由 article


// 使用body-parser中间件解析请求主体
app.use(bodyParser.urlencoded({ extended: false }))    
//返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(bodyParser.json())   

//设置post文件大小app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// path.join(__dirname, 'public') 表示工程路径后面追加 public
app.use(express.static(path.join(__dirname, 'public')))

//设置跨域访问
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 使用路由 
app.use(`/user`,user)
app.use(`/article`,article)

//配置服务端口 
let server = app.listen(3000, () => {
    console.log(`server running...`);
})