var dbService = {};

dbService.runSQL = function(con, sql){
	return new Promise(function(resolve, reject){
		
		con.query(sql, function(err, result){
			if(err || result == null || result == ""){
				reject(Error("err"));
			}
			else{
				resolve(result);
			}
		});
	});
}

module.exports = dbService;