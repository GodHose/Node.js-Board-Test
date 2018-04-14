var commonService = {};

commonService.redirectWithMessage = function(req, res, url, msg){
	// 인코딩 설정에 따른 처리
	msg = msg.replace(/\n/gi, "\\n"); 
	
	// 알럿 매개변수 설정 및 리다이렉팅
	req.flash('msg', msg);
	res.redirect(url);
}

commonService.backWithMessage = function(req, res, msg){
	resMsg =	"<script>";
	resMsg +=	"	alert('" + msg + "');";
	resMsg +=	"	history.back(-1);";
	resMsg +=	"</script>";

	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
	res.write(resMsg);
	res.end();
}

module.exports = commonService;