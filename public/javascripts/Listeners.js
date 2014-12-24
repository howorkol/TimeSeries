//var timeout;
//var disable_slides = true;
/*
$('#accordion_cont').liteAccordion({
    containerWidth: $(window).width() - 23,
    containerHeight: $(window).height() - 13,
    slideSpeed: 1000,
    theme : 'light'
});*/


//$(".tablesorter").tablesorter();
/*
d3.json('/query/sectors', function(err, data) {
    var sector_list = [];
        
    if (err) {
        callback(err);
        return;
    }

    data.forEach(function(d) {
        sector_list.push(d.sector); 
    });

    d3.select('#listbox')
        .selectAll('li.sector').data(sector_list)
        .enter().append('li')
        .attr('class', 'sector')
        .text(function(d) { return d; })
        .on('click', function(d) {
            new_sector(d);
        });
});

$('form#searchBox span#browse').click(function() {
    new_sector('All');
});*/

/*function new_sector(industry) {
    $('div#visualizations ul svg').remove();
    $('h3.company_label').remove();
    $('#company_table tbody tr').remove();
    
    model = new Model();
    selected_company = null;
    
    add_industry(industry, function(err) {
        if (err) {
            console.log('No data for ' + industry);
            return false;
        }
        
        disable_slides = false;
        $('h1.industry_name').text(industry);
        $('ol li:nth-child(2) span').click();
    });
}

$('span.slide_title').click(function() {
    if (disable_slides === true) { return false; }
});*/

/*
var YAHOO = {'Finance': {'SymbolSuggest': {}}};
var get_tickers = function(query, callback) {
    YAHOO.Finance.SymbolSuggest.ssCallback = function(data) {
        if (data.ResultSet.Result.length > 0) 
            callback(null, data.ResultSet.Result.map(function(item) {
                return {'ticker': item.symbol, 'name': item.name};
            }));
        else
            callback('err', null);
    }

    $.ajax({
        url: "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=" + query,
        dataType: 'jsonp',
        jsonpCallback: 'YAHOO.Finance.SymbolSuggest.ssCallback'
    });
}
*/

