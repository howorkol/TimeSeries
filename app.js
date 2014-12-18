var _port = 3000;

var express     = require('express'),
    parse       = require('url').parse,
    http        = require('http'),
    favicon     = require('serve-favicon'),
    logger      = require('morgan'),
    serveStatic = require('serve-static'),
    mysql       = require('mysql'),
    fs          = require('fs');

var logFile = fs.createWriteStream(__dirname + '/timeseries.log', {flags: 'a'});

var sqlPool = mysql.createPool({
    connectionLimit: 10,
    host:     'localhost',
    user:     'timeseries',
    password: 'timepass',
    database: 'timeseries'
});

var app = express();

app.set('port', process.env.PORT || _port);
//app.use(favicon());
app.use('/stylesheets', serveStatic(__dirname + '/public/stylesheets'));
app.use('/javascripts', serveStatic(__dirname + '/public/javascripts'));
app.use('/images', serveStatic(__dirname + '/public/images'));
app.use(logger('common', {stream: logFile}));

app.get('/', serveStatic(__dirname + '/'));

app.get('/query/sectors', function(req, res) {
    query_database('SELECT DISTINCT sector FROM companies', res);
});

app.get('/query/sector/*', function(req, res) {
    var sector = parse(req.url).pathname.substring(14).replace(/%20/g, ' ');
    var query = 'SELECT companyname, tickersymbol, industry, sector, ' +
            'consecutiveyears FROM companies';
    if (sector !== 'All')
        query += ' WHERE sector = "' + sector + '"';
    query += ' ORDER BY consecutiveyears DESC, tickersymbol ASC';

    query_database(query, res);
});

app.get('/query/company/*', function(req, res) {
    var tickersymbol = parse(req.url).pathname.substring(15);
    var query = 'SELECT year, dividendspaid, percentchange FROM companydata ' +
            'WHERE tickersymbol = "' + tickersymbol + '"';

    query_database(query, res);
});

var query_database = function(query, res) {
    sqlPool.getConnection(function(err, connection) {
        if (err) return res.status(500).send('Server Error');

        connection.query(query, function(err, rows) {
            if (err) return res.status(500).send('Server Error');
            if (rows.length === 0) return res.status(204).end();
            return res.json(rows);
        });
        connection.release();
    });
}

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGINT', function() {
    console.log('Express server caught SIGINT, exiting nicely.');
    server.close();
    //db.end();
    process.exit();
});
