var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js')
var router = express.Router();
var session = require('express-session');

router.route('/').all(function(req, res){
	/*
	var con = mysql.createConnection(dbconfig);
	var sql = 'SELECT * FROM tbl_login';	
	con.query(sql, function(err, result, fields){
		if(err)throw err;

		console.log(result);
		res.render("index.html",{
			title: "MY HOMEPAGE"
			,result: result
		});
		con.end();
	});
	*/

	res.render("index.html",{
		session: req.session
	});
});

router.route('/login').post(function(req, res){
	
	console.log('(ID:' + req.body.id + '/PW:' + req.body.pw + ') 로그인 시도');
	// id, pw 누락
	if(req.body.id == "" || req.body.pw == ""){
		return false;
	}

	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT name FROM tbl_login WHERE id = '" + req.body.id + "' AND pw = '" + req.body.pw + "'";
	con.query(sql, function(err, result, rows, fields){
		if(err)throw err;
		var nickname = result[0].name;

		if(nickname == null || nickname == ""){
			console.log('로그인 실패');
		}
		else{
			console.log('로그인 성공');
			req.session.userId = req.body.id;
			req.session.nickname = nickname;
		}
		res.redirect('./');
	});
});

router.route('/logout').post(function(req, res){
	req.session.destroy();
	res.redirect('./');
});

module.exports = router;
