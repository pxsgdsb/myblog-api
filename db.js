
const mysql = require('mysql');
const fs = require('fs')
const path = require('path')


let db = {};
let pool  = mysql.createPool({
  host: '127.0.0.1',
  user : 'root',
  password : 'px19991227',
  database : 'myblog_db',
  multipleStatements: true,  // 允许执行多条语句
});
 
db.query = function(sql, callback){
	if (!sql) {
		callback();
		return;
	}
	pool.query(sql, function(err, rows, fields) {
	  if (err) {
	    console.log(err);
	    callback(err, null);
	    return;
	  };
	  callback(null, rows, fields);
	});
}

// 查询数据
function dbSelect(parameter,pxsql){
    return new Promise((resolve, reject) => {
        let sql 
        if(pxsql){
            sql = pxsql
        }else{
            sql = `SELECT ${parameter.field.join(",")} FROM ${parameter.table}`
            if(parameter.where){
                let whereArr = []
                for(let key in parameter.where){    
                    whereArr.push(key + "=" + "'" + parameter.where[key] + "'")        
                }
                sql = sql + ` WHERE ${whereArr.join(' AND ')}` 
            }
            sql = sql +" order by id desc"
            if(parameter.limit){
                sql = sql + ` LIMIT ${parameter.limit}`
            }
        }
        // console.log(sql);
        db.query(sql,(err, data) =>{
            !err?resolve(data):reject(err)
        })
    }); 
}
// 插入数据
function dbInsert(parameter){
    return new Promise((resolve, reject) => {
        let sql
        if(typeof parameter.values[0] != "object"){
            sql = `INSERT INTO ${parameter.table} (${parameter.field.join(",")}) VALUES ('`+parameter.values.join("','")+`')`
        }else{
            let valuesto = []
            for (let item of parameter.values[0]) {
                valuesto.push("('" + item + "')")
            }
            sql = `INSERT INTO ${parameter.table} (${parameter.field.join(",")}) VALUES ${valuesto.join(',')}`;
        }
        db.query(sql,(err, data) =>{
            !err?resolve(data):reject(err)
        })
    }); 
}

// 删除数据
function dbDelete(parameter){
    return new Promise((resolve, reject) => {
        let whereArr = []
        for(let key in parameter.where){    
            whereArr.push(key + "=" + "'" + parameter.where[key] + "'")        
        }
        let sql = `DELETE FROM ${parameter.table} WHERE ${whereArr.join(' AND ')}`
        db.query(sql,(err, data) =>{
            !err?resolve(data):reject(err)
        })
    }); 
}
// 修改数据
function dbUpdate(parameter){
    return new Promise((resolve, reject) => {
        let fieldArr = []
        for(let key in parameter.field){    
            fieldArr.push(key + "=" + "'" + parameter.field[key] + "'")        
        }
        let whereArr = []
        for(let key in parameter.where){    
            whereArr.push(key + "=" + "'" + parameter.where[key] + "'")        
        }
        let sql = `UPDATE ${parameter.table} SET ${fieldArr.join(',')} WHERE ${whereArr.join(' AND ')}`
        // console.log(sql);
        db.query(sql,(err, data) =>{
            !err?resolve(data):reject(err)
        })
    });
}


// 文章保存md文件
function setMd(name,content){
    return new Promise((resolve, reject) => {
        let mypath = `./myArticle/${name}.md`
        fs.writeFile(mypath, content, { flag: 'w+' }, err => {
            if (err) {
                reject(err)
                return
            }
            resolve(mypath)
        })
    }); 
}

//删除文件
function deleteFile(url,name){
    return new Promise((resolve, reject) => {
        console.log(url,name);
        var files = [];
        if( fs.existsSync(url) ) {    //判断给定的路径是否存在
            files = fs.readdirSync(url);    //返回文件和子目录的数组
            files.forEach(function(file,index){
                var curPath = path.join(url,file);
                if(fs.statSync(curPath).isDirectory()) { //同步读取文件夹文件，如果是文件夹，则函数回调
                    deleteFile(curPath,name);
                } else {   
                    if(file.indexOf(name)>-1){    //是指定文件，则删除
                        fs.unlinkSync(curPath);
                        resolve("成功删除文件："+curPath);
                    }
                }  
            });
        }else{
            reject("给定的路径不存在！")
        }
    });
}



module.exports = {
    dbSelect,dbInsert,setMd,deleteFile,dbDelete,dbUpdate
};