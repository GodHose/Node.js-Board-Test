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
		,msg : ''
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

router.route('/account').post(function(req, res){
	if(req.body.id == "" || req.body.pw == "" || req.body.nick == ""){
		req.flash('msg','필수 정보가 누락되어 있습니다');
		res.redirect('/');
		return false;
	}

	id = req.body.id;
	pw = req.body.pw;
	nick = req.body.nick;

	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT COUNT(*) as cnt FROM tbl_login WHERE id = '" + id + "'";
	con.query(sql, function(err, result){
		if(err)throw err;
		console.log(result);

		if(result[0].cnt > 0){
			req.flash('msg', '중복되는 아이디가 존재합니다');
			res.redirect('/');
			return false;
		}

		sql = "	INSERT INTO tbl_login(id, pw, name) VALUES('" + id + "', '" + pw + "', '" + nick + "')";
		con.query(sql, function(err, result){
			if(err)throw err;
			console.log(result.message);
		
			//req.session.userId = id;
			//req.session.nickname = nick;

			//req.flash('session', req.session);
			req.flash('msg', '성공적으로 계정이 생성되었습니다');
			res.redirect('/');
		});
	});
});

module.exports = router;
