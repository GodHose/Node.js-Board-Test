var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');

// EXPRESS
var app = express();
var session = require('express-session');

//
var cors = require('cors');

// PORT
var port = 3333;
app.set('port', port);

// HTML
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// STATIC
app.use(express.static('public'));
app.use(express.static('uploads'));

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
app.use(flash());
app.use(cors());

// ROUTER
var routerIndex = require('./routes/index');
app.use('/', routerIndex);

var routerBoard = require('./routes/board');
app.use('/board/', routerBoard);
