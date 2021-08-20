
const mysql = require('mysql');

let db = {};
let pool  = mysql.createPool({
  host: 'localhost',
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

// 查询
function dbSelect(parameter){
    return new Promise((resolve, reject) => {
        let sql = parameter.where ? `SELECT ${parameter.field.join(",")} FROM ${parameter.table} WHERE ${parameter.where} ` 
        : `SELECT ${parameter.field.join(",")} FROM ${parameter.table} `
        db.query(sql,function (err, data) {
            !err?resolve(data):reject(err)
        })
    }); 
}
// 插入
function dbInsert(parameter){
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO ${parameter.table} (${parameter.field.join(",")})VALUES (?,?,?,?,?,?)`
        db.query(sql,parameter.values,function (err, data) {
            !err?resolve(data):reject(err)
        })
    }); 
}

module.exports = {
    dbSelect,dbInsert
};