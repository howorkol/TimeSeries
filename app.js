var _port = 3000;

var express     = require('express'),
    http        = require('http'),
    favicon     = require('serve-favicon'),
    logger      = require('morgan'),
    serveStatic = require('serve-static'),
    mysql       = require('mysql');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'username',
    password: 'userpass',
    database: 'timeseries'
});
db.connect();
/*
var q = "select * from companies";
db.query(q, function(err, rows, fields) {
    if (err) console.log('err');
    console.log(rows[0].tickersymbol);
});

db.end();*/

var app = express();

app.set('port', process.env.PORT || _port);
//app.use(favicon());
app.use(logger('dev'));
app.use('/stylesheets', serveStatic(__dirname + '/public/stylesheets'));
app.use('/javascripts', serveStatic(__dirname + '/public/javascripts'));

app.get('/', serveStatic(__dirname + '/'));

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
