var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var commonService = require('./service/commonService.js');
var router = express.Router();
var session = require('express-session');

// 
var multer = require('multer');
var fs = require('fs');

// 파일 업로드
var storage = multer.diskStorage({
	destination: function(req, file, callback){
		callback(null, 'uploads')
	},
	filename: function(req, file, callback){
		callback(null, file.originalname)
	}
});

var upload = multer({
	storage: storage,
	limits: {
		files: 10,
		fileSize: 10 * 1024 * 1024 * 1024
	}
});


// 게시글 리스트 보기
router.route('/list').get(function(req, res){
	
	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT bno, title, nickname, regdate, viewcnt FROM tbl_board ORDER BY bno DESC";
	con.query(sql, function(err, result){
		if(err)throw err;

		res.send(result);
	});
});

// 게시글 등록
router.route('/write')
	.get(function(req, res){ // 폼
		res.render('write.html',{session:req.session, bno:''});
	})
	.post(upload.single('attachment'),function(req, res){ // 프로시저

		var attachment = req.file;

		title = req.body.title;
		content = req.body.content;
		writer = req.session.userId
		nickname = req.session.nickname;

		var con = mysql.createConnection(dbconfig);
		var sql =	"INSERT INTO tbl_board(title, writer, nickname, content, regdate)"
		sql +=		"	VALUES('" + title + "', '" + writer + "', '" + nickname + "', '" + content + "', NOW())"
		con.query(sql, function(err, result){
			if(err)throw err;

			console.log(result.message);

			url = "/";
			msg = "성공적으로 글을 게시하였습니다";

			if(attachment == null){
				commonService.redirectWithMessage(req, res, url, msg);
				return;
			}
			else{
				sql = "SELECT bno FROM tbl_board WHERE writer = '" + writer + "' ORDER BY bno DESC LIMIT 1";
				con.query(sql, function(err, result){
					if(err)throw err;

					bno = result[0].bno;
					file_path = attachment.path;
					file_name = attachment.filename;
					file_ext = file_name.substring(file_name.indexOf(".")+1, file_name.length);
					file_size = attachment.size;

					sql =	"INSERT INTO tbl_file(bno, file_path, file_name, file_ext, file_size)"
					sql +=	"	VALUES('"+bno+"', '"+file_path+"', '"+file_name+"', '"+file_ext+"', '"+file_size+"')"
					con.query(sql, function(err, result){
						if(err)throw err;

						console.dir('#===== 업로드된 파일 정보 =====#');
						console.dir(attachment);
						console.dir('#=====#');

						commonService.redirectWithMessage(req, res, url, msg);
						return;
					});
				});
			
			}
		});
	});

// 게시글 수정
router.route('/update')
	.get(function(req, res){
		bno = req.query.bno;
		var con = mysql.createConnection(dbconfig);
		var sql =	"SELECT bno, title, writer, nickname, content "
		sql +=		",(SELECT file_name FROM tbl_file WHERE bno = '"+bno+"' ORDER BY idx DESC LIMIT 1) as file_name "
		sql +=		",(SELECT idx FROM tbl_file WHERE bno = '"+bno+"' ORDER BY idx DESC LIMIT 1) as file_idx "
		sql +=		"FROM tbl_board "
		sql +=		"WHERE bno = '" + bno + "' "
		con.query(sql, function(err, result){
			if(err)throw err;
			console.log(result);
		
			title = result[0].title;
			writer = result[0].writer;
			nickname = result[0].nickname;
			content = result[0].content;

			file_name = result[0].file_name;
			file_idx = result[0].file_idx;

			res.render('write.html',{
				session: req.session
				,bno: bno
				,title: title
				,writer: writer
				,nickname: nickname
				,content: content
				,file_name: file_name
				,file_idx: file_idx
			});
			
		});
	})
	.post(upload.single('attachment'),function(req, res){

		var attachment = req.file;

		bno = req.body.bno;
		title = req.body.title;
		content = req.body.content;

		var con = mysql.createConnection(dbconfig);
		var sql = "UPDATE tbl_board SET title = '" + title + "', content = '" + content + "' WHERE bno = '" + bno + "'";
		con.query(sql, function(err, result){
			if(err)throw err;
			console.log(result);

			url = '/board/read?bno='+bno;
			msg = '성공적으로 글을 수정하였습니다';

			if(attachment == null){
				commonService.redirectWithMessage(req, res, url, msg);
				return;
			}
			else{
				file_path = attachment.path;
				file_name = attachment.filename;
				file_ext = file_name.substring(file_name.indexOf(".")+1, file_name.length);
				file_size = attachment.size;

				sql =	"INSERT INTO tbl_file(bno, file_path, file_name, file_ext, file_size)"
				sql +=	"	VALUES('"+bno+"', '"+file_path+"', '"+file_name+"', '"+file_ext+"', '"+file_size+"')"
				con.query(sql, function(err, result){
					if(err)throw err;

					console.dir('#===== 업로드된 파일 정보 =====#');
					console.dir(attachment);
					console.dir('#=====#');

					commonService.redirectWithMessage(req, res, url, msg);
					return;
				});
			}

			
			
		});
	});


// 게시글 상세 읽기
router.route('/read').get(function(req, res){
	bno = req.query.bno;

	var con = mysql.createConnection(dbconfig);

	// 조회 수 증가
	var sql = "UPDATE tbl_board SET viewcnt = viewcnt + 1 WHERE bno = '" + bno + "'";
	con.query(sql, function(err, result){
		if(err)throw err;
		console.log(result.message);

		// 게시글 로딩
		sql =		"SELECT bno, title, writer, nickname, content "
		sql +=		",(SELECT file_name FROM tbl_file WHERE bno = '"+bno+"' ORDER BY idx DESC LIMIT 1) as file_name "
		sql +=		",(SELECT idx FROM tbl_file WHERE bno = '"+bno+"' ORDER BY idx DESC LIMIT 1) as file_idx "
		sql +=		"FROM tbl_board ";
		sql +=		"WHERE bno = '" + bno + "' ";
		con.query(sql, function(err, result){
			if(err)throw err;
			console.log(result);

			if(result == null || result == ""){ // 찾을 수 없는 게시글 예외 처리
				commonService.backWithMessage(req, res, '존재하지 않는 게시글입니다');
				return;
			}
	
			title = result[0].title;
			writer = result[0].writer;
			nickname = result[0].nickname;
			content = result[0].content;

			file_name = result[0].file_name;
			file_idx = result[0].file_idx;
	
			res.render('read.html',{
				session: req.session
				,bno: bno
				,title: title
				,writer: writer
				,nickname: nickname
				,content: content
				,file_name: file_name
				,file_idx: file_idx
			});
		});
	});
});

// 첨부파일 다운로드
router.route('/download/:fileid').get(function(req, res){
	var fileid = req.params.fileid;
	
	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT file_path FROM tbl_file WHERE idx = '"+fileid+"'";
	con.query(sql, function(err, result){
		if(err)throw err;

		if(result == null || result == ""){ // 찾을 수 없는 첨부파일 예외 처리
			commonService.backWithMessage(req, res, '존재하지 않는 파일입니다');
			return;
		}
		
		file_path = result[0].file_path;
		res.download(file_path);
		
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
		console.log(result.message);

		res.redirect('/');
	});
});

module.exports = router;
