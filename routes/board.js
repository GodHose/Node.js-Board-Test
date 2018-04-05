var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var router = express.Router();
var session = require('express-session');
const url = require('url');

router.route('/list').get(function(req, res){
	
	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT bno, title, writer, regdate, viewcnt FROM tbl_board ORDER BY bno DESC";
	con.query(sql, function(err, result, rows, fields){
		if(err)throw err;

		res.send(result);
	});
});

router.route('/write')
	.get(function(req, res){ // 폼
		res.render('write.html',{session:req.session});
	})
	.post(function(req, res){ // 프로시저

		title = req.body.title;
		content = req.body.content;
		writer = req.body.writer;

		var con = mysql.createConnection(dbconfig);
		var sql =	"INSERT INTO tbl_board(title, writer, content, regdate)"
		sql +=		"	VALUES('" + title + "', '" + writer + "', '" + content + "', NOW())"
		con.query(sql, function(err, result){
			if(err)throw err;

			console.log(result);
			msg="성공적으로 글을 게시하였습니다";
			res.redirect(url.format({
				pathname:'/'
				,query:{
					msg:msg
				}
			}));
		});
	});

module.exports = router;
