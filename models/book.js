const mysql = require('mysql');
const config = require('../config');
const pool = mysql.createPool(config.mysql);

//Sql语句
const commands = {
    insert: 'INSERT INTO books(title, isbn, creator, pub, class, `call`, note, language) \
            VALUES( ?, ?, ?, ?, ?, ?, ?, ?)',
    update: 'update books set title=?, isbn=?, creator=?, pub=?, class=?, `call`=?, note=?, language=? where no=?',
    delete: 'delete from books where no=?',
    queryAll: 'select * from books',
    query: 'select * from books '
};

// 导出的方法对象
const book = {
    /**
     * 添加书籍信息
     */
    add: function(req, res, next) {

        let param = req.body || req.query || req.params;
        //取出连接
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log("数据库连接失败")
            } else {
                connection.query(commands.insert, [param.title, param.isbn, JSON.stringify(param.creator), param.pub, param.class, param.note, param.call, param.language],
                    function(err, rows) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.json({ code: 200, msg: 'BOOK ADD SUCCESS' });
                        }
                        // 释放连接 
                        connection.release();
                    });
            }
        });
    },
    /**
     * 通过param查询书籍信息
     */
    query: function(req, res, next) {
        let param = req.query || req.body || req.params;
        let mode = "title"
        for (let i in param) {
            mode = i
        }
        let commandQuery = commands.query + `where ${mode}="${param[mode]}"`;
        if (mode == "creator") {
            commandQuery = commands.query + `WHERE creator->"$.main" like "%${param[mode]}%" or creator->"$.addition" like "%${param[mode]}%" `;
        }
        console.log(commandQuery);
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log("数据库连接失败")
            } else {
                connection.query(commandQuery, function(err, rows) {
                    if (err)
                        res.send(err);
                    else
                        res.json(rows);
                    // 释放连接 
                    connection.release();
                });
            }
        });
    },
    /**
     * 查询全部书籍信息
     */
    queryAll: function(req, res, next) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log("数据库连接失败")
            } else {
                connection.query(commands.queryAll, function(err, rows) {
                    if (err)
                        res.send(err);
                    else
                        res.json(rows);
                    // 释放连接 
                    connection.release();
                });
            }
        });
    },
    /**
     * 更改数据
     */
    update: function(req, res, next) {
        pool.getConnection(function(err, connection) {
            let param = req.body || req.query || req.params;
            if (err) {
                console.log("数据库连接失败")
            } else {
                connection.query(commands.update, [param.title, param.isbn, JSON.stringify(param.creator), param.pub, param.class, param.call, param.note, param.language, param.no],
                    function(err, rows) {
                        if (err)
                            res.send(err);
                        else
                            res.json({ code: 200, msg: 'BOOK UPDATE SUCCESS' });
                        // 释放连接 
                        connection.release();
                    });
            }
        });
    },
    /**
     * 删除数据
     */
    delete: function(req, res, next) {
        pool.getConnection(function(err, connection) {
            let param = req.body || req.query || req.params
            console.log(param);
            if (err) {
                console.log("数据库连接失败")
            } else {
                connection.query(commands.delete, param.no, function(err, rows) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json({ code: 200, msg: 'BOOK DELETE SUCCESS' });
                    }
                    connection.release();
                });
            }
        });
    }
}

module.exports = book;