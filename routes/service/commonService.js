var commonService = {};

commonService.redirectWithMessage = function(req, res, url, msg){
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