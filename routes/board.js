var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var router = express.Router();
var session = require('express-session');
const url = require('url');

// 게시글 리스트 보기
router.route('/list').get(function(req, res){
	
	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT bno, title, nickname, regdate, viewcnt FROM tbl_board ORDER BY bno DESC";
	con.query(sql, function(err, result, rows, fields){
		if(err)throw err;

		res.send(result);
	});
});

// 게시글 등록
router.route('/write')
	.get(function(req, res){ // 폼
		res.render('write.html',{session:req.session, bno:''});
	})
	.post(function(req, res){ // 프로시저

		title = req.body.title;
		content = req.body.content;
		writer = req.session.userId
		nickname = req.session.nickname;

		var con = mysql.createConnection(dbconfig);
		var sql =	"INSERT INTO tbl_board(title, writer, nickname, content, regdate)"
		sql +=		"	VALUES('" + title + "', '" + writer + "', '" + nickname + "', '" + content + "', NOW())"
		con.query(sql, function(err, result){
			if(err)throw err;

			console.log(result);

			// 게시완료 alert 해야함
			req.flash('msg', '성공적으로 글을 게시하였습니다');
			res.redirect('/');
		});
	});

// 게시글 수정
router.route('/update')
	.get(function(req, res){
		bno = req.query.bno;
		var con = mysql.createConnection(dbconfig);
		var sql =	"SELECT bno, title, writer, nickname, content "
		sql +=		"FROM tbl_board "
		sql +=		"WHERE bno = '" + bno + "' "
		con.query(sql, function(err, result){
			if(err)throw err;
			console.log(result);
		
			title = result[0].title;
			writer = result[0].writer;
			nickname = result[0].nickname;
			content = result[0].content;

			res.render('write.html',{
				session: req.session
				,bno: bno
				,title: title
				,writer: writer
				,nickname: nickname
				,content: content
			});
			
		});
	})
	.post(function(req, res){
		bno = req.body.bno;
		title = req.body.title;
		content = req.body.content;

		var con = mysql.createConnection(dbconfig);
		var sql = "UPDATE tbl_board SET title = '" + title + "', content = '" + content + "' WHERE bno = '" + bno + "'";
		con.query(sql, function(err, result){
			if(err)throw err;
			console.log(result);
			
			req.flash('msg', '성공적으로 글을 수정하였습니다');
			res.redirect('/board/read?bno='+bno);
		});
	});


// 게시글 상세 읽기
router.route('/read').get(function(req, res){
	bno = req.query.bno;

	var con = mysql.createConnection(dbconfig);
	var sql =	"SELECT bno, title, writer, nickname, content "
	sql +=		"FROM tbl_board ";
	sql +=		"WHERE bno = '" + bno + "' ";
	con.query(sql, function(err, result){
		if(err)throw err;
		console.log(result);

		title = result[0].title;
		writer = result[0].writer;
		nickname = result[0].nickname;
		content = result[0].content;

		res.render('read.html',{
			session: req.session
			,bno: bno
			,title: title
			,writer: writer
			,nickname: nickname
			,content: content
		});
	});
});

// 게시글 삭제
router.route('/delete').delete(function(req, res){
	bno = req.body.bno;
	var con = mysql.createConnection(dbconfig);
	var sql =	"DELETE FROM tbl_board "
	sql +=		"WHERE bno = '" + bno + "'";
	con.query(sql, function(err, result){
		if(err)throw err;
		console.log(result);

		// 삭제 완료 alert 해야함
		res.redirect('/');
	});
});

module.exports = router;
