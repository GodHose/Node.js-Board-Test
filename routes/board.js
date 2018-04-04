var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js')
var router = express.Router();
var session = require('express-session');

router.route('/list').get(function(req, res){
	
	var con = mysql.createConnection(dbconfig);
	var sql = "SELECT bno, title, writer, regdate, viewcnt FROM tbl_board ORDER BY bno DESC";
	con.query(sql, function(err, result, rows, fields){
		if(err)throw err;

		res.send(result);
	});
});

module.exports = router;
