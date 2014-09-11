
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ejs = require('ejs');
var movie = require('./routes/movie')
var SessionStore = require("session-mongoose")(express);
var store = new SessionStore({
url: "mongodb://localhost/session",
interval: 120000
});
var io = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3100);
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');// app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.cookieSession({secret : 'fens.me'}));

app.use(express.session({
secret : 'fens.me',
store: store,
cookie: { maxAge: 900000 }
}));

app.use(function(req, res, next){
res.locals.user = req.session.user;
var err = req.session.error;
delete req.session.error;
res.locals.message = '';
if (err) res.locals.message = '<div class="alert alert-error">' + err + '</div>';
next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.all('/login', notAuthentication);
app.get('/login', routes.login);
app.post('/login', routes.doLogin);
app.get('/logout', authentication);
app.get('/logout', routes.logout);
app.get('/home', authentication);
app.get('/home', routes.home);
app.get('/movie/list', authenticationList);
app.get('/movie/list', notauthenticationList);

app.get('/movie/list',movie.movieList);//增加
app.get('/movie/add',movie.movieAdd);//增加
app.post('/movie/add',movie.doMovieAdd);//提交
app.get('/movie/:name',movie.movieAdd);//编辑查询
app.get('/movie/json/:name',movie.movieJSON);//JSON数据

function authentication(req, res, next) {
if (!req.session.user) {
req.session.error='请先登陆';
return res.redirect('/login');
}
next();
}

function authenticationList(req, res, next) {
if (!req.session.user) {
req.session.error='请先登陆';
return res.redirect('/login');
}
next();
}

function notauthenticationList(req, res, next) {
if (!req.session.user) {
req.session.error='请先登陆';
return res.redirect('/movie/list');
}
next();
}

function notAuthentication(req, res, next) {
if (req.session.user) {
req.session.error='已登陆';
return res.redirect('/home');
}
next();
}

var server=http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//创建socket
io.listen(server).on('connection', function (socket) {
 console.log('connection');
    socket.broadcast.emit('event', { some: 'new ',message:"nihao" });
    socket.on('message', function (name,msg) {
        console.log('Message Received: ', name+":"+msg);
       // socket.broadcast.emit('message', name+":"+msg);
	    socket.broadcast.emit('event', { some:name+":"+msg,message:"nihao" });
    });
	var j=0;
	setInterval(function(){
		socket.emit('event', { some: 'tick '+j,message:"nihao"+j });
		j++;
	},3000);	
});


http.get('http://nodeapi.ucdok.com/#/api/http.json', function(res) {
  console.log("statusCode: ");
  console.log("headers: ");

  res.on('data', function(d) {
   console.log("data");
   process.stdout.write(d);
  });

}).on('error', function(e) {
 console.log("error: ");
});

   //定时执行
   var timeoutTime = 1000; // one second
   var timeout = setTimeout(function() {
            console.log("timed out!");
   }, timeoutTime);
   clearTimeout(timeout);
	 

//重复执行	   
  var i=0;
  var period = 10000; // 1 second
                   setInterval(function() {
                           console.log("tick"+i);
						   i++;
                   }, period);
				   
/* var http = require('http');
var options = {
    host: 'www.blackglory.me',
    path: '/',
    method: 'GET',
    headers: {
        'Accept': 'text/html'
    }
};
var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        console.log(data);
    });
});
req.end(); */

