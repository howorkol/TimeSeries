var _port = 3000;

var express     = require('express'),
    parse       = require('url').parse,
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

var app = express();

app.set('port', process.env.PORT || _port);
//app.use(favicon());
app.use(logger('dev'));
app.use('/stylesheets', serveStatic(__dirname + '/public/stylesheets'));
app.use('/javascripts', serveStatic(__dirname + '/public/javascripts'));

app.get('/', serveStatic(__dirname + '/'));
app.get('/query/*', function(req, res) {
    var company = parse(req.url).pathname.substring(7);
    var query = 'select year, dividendvalue, percentchange from ' +
                'companyinfo where tickersymbol="' + company + '"';
    
    db.query(query, function(err, rows) {
        if (err)
            return res.status(500).send('Server Error');
        
        if (rows.length === 0)
            return res.status(204).end();
        else
            return res.json(rows);
    });
});
app.get('/industry/*', function(req, res) {
    var company = parse(req.url).pathname.substring(10);
    var query = 'select year, avg(dividendvalue) as dividendvalue, avg(percentchange) as percentchange from ' +
                'companyinfo join companies where companyinfo.tickersymbol ' +
                '= companies.tickersymbol and companies.industry in ' +
                '(select industry from companies where tickersymbol = "' + 
                company + '") group by year';
    
    db.query(query, function(err, rows) {
        if (err)
            return res.status(500).send('Server Error');
        
        if (rows.length === 0)
            return res.status(204).end();
        else
            return res.json(rows);
    });
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGINT', function() {
    console.log('Express server caught SIGINT, exiting nicely.');
    server.close();
    db.end();
    process.exit();
});