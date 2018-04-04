var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// EXPRESS
var app = express();
var session = require('express-session');

// PORT
var port = 3333;
app.set('port', port);

// HTML
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// STATIC
app.use(express.static('public'));

// POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// SESSION
app.use(cookieParser());
app.use(session({
	secret: 'qwer1234'
	,resave: true
	,saveUninitialized: true
}));

var server = http.createServer(app);

server.listen(app.get('port'));

// MIDDLEWARE

// ROUTER
var routerIndex = require('./routes/index');
app.use('/', routerIndex);

var routerBoard = require('./routes/board');
app.use('/board/', routerBoard);
