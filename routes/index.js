var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var commonService = require('./service/commonService.js');
var dbService = require('./service/dbService.js');
var router = express.Router();
var session = require('express-session');

router.route('/').all(function(req, res){
	page  = req.query.page;
	if(page == null || page == "" || page <= 0) page=1;
	else page*=1;
	
	pageSize = req.query.pageSize;
	if(pageSize == null || pageSize == "" || pageSize <= 0) pageSize=15;
	else pageSize*=1;

	var param = {};
	param.page = page;
	param.pageSize = pageSize;

	var boardCnt = 0;

	var con = mysql.createConnection(dbconfig);
	sql = "SELECT COUNT(*) as cnt FROM tbl_board";

	var promise = dbService.runSQL(con, sql);
	promise
		.then(function(result){
			console.log(result);
			
			var cnt = result[0].cnt;
			boardCnt = cnt;

			console.log(cnt);
			
			if(cnt <= 0){
				return Promise.reject("boardCnt:0");
			}

			sql =	" SELECT bno, title, nickname, regdate, viewcnt";
			sql +=	" FROM tbl_board";
			sql +=	" ORDER BY bno DESC";
			sql +=	" LIMIT " + ((page-1)*pageSize) + ", " + pageSize;

			return dbService.runSQL(con, sql);			
		})
		.catch(function(error){
			return Promise.reject(error);
		})
		.then(function(result){

			console.dir(result);
			console.dir(param);

			res.render('index.html',{
				cnt:boardCnt
				,param:param
				,result: result
				,session: req.session
				,msg:''
			});
		})
		.catch(function(error){
			res.render('index.html',{
				cnt: 0
				,param:param
				,session: req.session
				,msg:''
			});
			console.error("에러: " + error);
		});
	/*
	promise
		.then(function(result){
			console.log(result);
			
			var cnt = result[0].cnt;
			boardCnt = cnt;

			console.log(cnt);
			
			if(cnt <= 500){
				res.render('index.html',{
					cnt: boardCnt
					,param:param
					,session: req.session
					,msg:''
				});
				return Promise.reject("에러 메시지");
			}
			else{
				sql =	" SELECT bno, title, nickname, regdate, viewcnt";
				sql +=	" FROM tbl_board";
				sql +=	" ORDER BY bno DESC";
				sql +=	" LIMIT " + ((page-1)*pageSize) + ", " + pageSize;

				return dbService.runSQL(con, sql);
			}
		}, function(error){
			console.error("에러: " + error);
		})
		.then(function(result){

			console.dir(result);
			console.dir(param);

			if(result == null){
				res.render('index.html',{
					cnt: boardCnt
					,param:param
					,session: req.session
					,msg:''
				});
			}
			else{
				res.render('index.html',{
					cnt:boardCnt
					,param:param
					,result: result
					,session: req.session
					,msg:''
				});
			}

		}, function(error){
			console.error("에러: " + error);
		});
	*/
});

router.route('/login').post(function(req, res){
	
	console.log('(ID:' + req.body.id + '/PW:' + req.body.pw + ') 로그인 시도');
	// id, pw 누락
	if(req.body.id == "" || req.body.pw == ""){
		commonService.redirectWithMessage(req, res, '/', '필수 정보가 누락되어 있습니다\n\n다시 시도해 주십시오');
		return;
	}

	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT name FROM tbl_login WHERE id = '" + req.body.id + "' AND pw = '" + req.body.pw + "'";

	var promise = dbService.runSQL(con, sql);
	promise
		.then(function(result){
			var nickname = result[0].name;

			console.log('로그인 성공');
			req.session.userId = req.body.id;
			req.session.nickname = nickname;
	
			sql = "UPDATE tbl_login SET last_login = NOW() WHERE id = '" + req.body.id + "'";
			return dbService.runSQL(con, sql);
		})
		.catch(function(error){
			commonService.redirectWithMessage(req, res, '/', '존재하지 않는 계정입니다.\n\n아이디나 패스워드를 다시 확인해 주십시오');
			return Promise.reject(error);
		})
		.then(function(result){
			console.log(result.message);
			res.redirect('/');
		});
});

router.route('/logout').post(function(req, res){
	req.session.destroy();
	res.redirect('./');
});

router.route('/account').post(function(req, res){
	if(req.body.id == "" || req.body.pw == "" || req.body.nick == ""){
		commonService.redirectWithMessage(req, res, '/', '필수 정보가 누락되어 있습니다');
		return;
	}

	id = req.body.id;
	pw = req.body.pw;
	nick = req.body.nick;

	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT COUNT(*) as cnt FROM tbl_login WHERE id = '" + id + "'";
	
	var promise = dbService.runSQL(con, sql);
	promise
		.then(function(result){
			if(result[0].cnt > 0){
				return Promise.reject("DUPLICATE");
			}

			sql = "	INSERT INTO tbl_login(id, pw, name) VALUES('" + id + "', '" + pw + "', '" + nick + "')";
			return dbService.runSQL(con, sql);
		})
		.catch(function(err){
			return Promise.reject(err);
		})
		.then(function(result){
			console.log(result.message);
			commonService.redirectWithMessage(req, res, '/', '성공적으로 계정이 생성되었습니다');
		})
		.catch(function(err){
			if(err == "DUPLICATE"){
				commonService.redirectWithMessage(req, res, '/', '중복되는 아이디가 존재합니다');
			}
			else{
				commonService.redirectWithMessage(req, res, '/', '계정 생성 중 문제가 발생했습니다.\n\n다시 시도해 주십시오');
			}			
		});
});



router.route('/async').get(function(req, res){
	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT bno FROM tbl_board ORDER BY bno DESC LIMIT 1";

	var promise = dbService.runSQL(con, sql);
	promise
		.then(function(result){
			sql = "SELECT viewcnt FROM tbl_board WHERE bno = '"+result[0].bno+"'";
			return dbService.runSQL(con, sql);
		}, function(error){
			console.error("에러: " + error);
		})
		.then(function(result){
			console.dir(result);
		}, function(error){
			console.error("에러: " + error);
		});
});

module.exports = router;
