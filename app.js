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
    user: 'timeseries',
    password: 'timepass',
    database: 'timeseries'
});
db.connect();

var app = express();

app.set('port', process.env.PORT || _port);
//app.use(favicon());
app.use(logger('dev'));
app.use('/stylesheets', serveStatic(__dirname + '/public/stylesheets'));
app.use('/javascripts', serveStatic(__dirname + '/public/javascripts'));
app.use('/images', serveStatic(__dirname + '/public/images'));

app.get('/', serveStatic(__dirname + '/'));
app.get('/query/*', function(req, res) {
    var company = parse(req.url).pathname.substring(7);
    var query = 'select year, dividendspaid, percentchange from ' +
                'companydata where tickersymbol="' + company + '"';
    
    db.query(query, function(err, rows) {
        if (err) return res.status(500).send('Server Error');
        if (rows.length === 0) return res.status(204).end();
        return res.json(rows);
    });
});

app.get('/sectors', function(req, res) {
    var sector = parse(req.url).pathname.substring(12);
    
    var query = 'select distinct sector from companies';
    db.query(query, function(err, rows) {
	if (err) return res.status(500).send('Server Error');
        if (rows.length === 0) return res.status(204).end();
        return res.json(rows);
    });
});

app.get('/sector/*', function(req, res) {
    var sector = parse(req.url).pathname.substring(8).replace(/%20/g, ' ');
    console.log(sector); 
    var data = {};
    var error;
    var no_data = false;
    var queries_done = 0;
    
    /*var query1 = 'select year, avg(dividendspaid) as DividendsPaid, ' +
                'avg(percentchange) as PercentChange from ' +
                'companydata join companies where companydata.tickersymbol ' +
                '= companies.tickersymbol and companies.industry = "' +
                industry + '" group by year';*/
    
    var query1 = 'select year, avg(dividendspaid) as dividendspaid, ' +
                'avg(percentchange) as percentchange from ' +
                'companydata join companies where companydata.tickersymbol ' +
                '= companies.tickersymbol';
    if (sector !== 'All')
        query1 += ' and companies.sector = "' + sector + '"';
    query1 += ' group by year';
    
    db.query(query1, function(err, rows) {
        if (err) return res.status(500).send('Server Error');
        if (rows.length === 0) return res.status(204).end();
        data.average = rows;
        queries_done++;
        if (queries_done == 2) return res.json(data);
    });
    
//    var query2 = 'select companyname, tickersymbol, industry, noyears ' +
//                'from companies where industry like "%' + industry + '%"';
    var query2 = 'select companyname, tickersymbol, industry, sector, consecutiveyears ' +
                'from companies';
    if (sector !== 'All') 
        query2 += ' where sector = "' + sector + '"';
    query2 += ' order by consecutiveyears desc, tickersymbol asc';
    
    db.query(query2, function(err, rows) {
        if (err) return res.status(500).send('Server Error');
        if (rows.length === 0) return res.status(204).end();
        data.companies = rows;
        queries_done++;
        if (queries_done == 2) return res.json(data);
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
