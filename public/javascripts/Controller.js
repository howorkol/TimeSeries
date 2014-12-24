var chart_height;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var clicked_companies = [];

var timeout;
var disable_slides = true;

$('#accordion_cont').liteAccordion({
    containerWidth: $(window).width() - 23,
    containerHeight: $(window).height() - 13,
    slideSpeed: 1000,
    theme : 'light'
});

$(".tablesorter").tablesorter();

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
});

function new_sector(industry) {
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
});

function add_industry(sector, callback) {
    d3.json('/query/sector/' + sector, function(err, data) {
        if (err) return callback(err);
        update_company_table(data);
        callback(null);
    });
}

function add_company(company, callback) {
    var success = 0;
    company = company.toUpperCase();
    model.add_company(company);
    
    d3.json('/query/company/' + company, function(err, data) {
        if (err) return callback(err);
        model.add_db_data(company, data);
        if (++success === 2) return callback(null);
    });

    query = 'https://www.quandl.com/api/v1/datasets/WIKI/' + company +
            '.json?collapse=annual&auth_token=WczNwgPepRcbZR9Yf7qt'

    d3.json(query, function(err, data) {
        if (err) data = [{'Date': '2013-12-31', 'Close': null, 'Volume': null}];
        else {
            data = data.data.reverse().map(function(d) {
                return {'Date': d[0], 'Close': d[4], 'Volume': d[5]};
            });
        }
//        console.log(data);
        model.add_quandl_data(company, data);
        if (++success === 2) return callback(null);
        
    });
}

function click_company(company) {
    if (clicked_companies.indexOf(company) === -1) {
        clicked_companies.push(company);
        d3.selectAll('g.chart path#' + company.replace('.', '\\.'))
            .classed('deselected', true)
            .moveToFront();
    } else {
        var index = clicked_companies.indexOf(company);
        clicked_companies.splice(index, 1);
        d3.selectAll('g.chart path#' + company.replace('.', '\\.'))
            .classed('deselected', false);
    }
}

function delete_company(company_name, callback) {
    model.delete_company(company_name);
    callback(company_name);
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        var par = this.parentNode;
        par.parentNode.appendChild(par);
    });
};

function update_company_table(all_companies) {
    for (var i = 0; i < all_companies.length; i++) {
        var data = all_companies[i];
        var html = '<tr id="' + data.tickersymbol + '"><td>' + 
                data.companyname + '</td><td>' + data.tickersymbol + 
                '</td><td>' + data.industry + '</td><td>' + data.sector + 
                '</td><td>' + data.consecutiveyears + '</td></tr>';
        $('#company_table tbody').append(html);
    }
    $('#company_table').trigger('update');
    
    $('#company_table tbody tr').click(function() {
        var row = $(this);
        var company = row.attr('id');

        if (model.company_present(company)) {
            delete_company(company, function(company_name) {
                company_name = company_name.replace('.', '\\.');
                $('h3.company_label#' + company_name).remove();
                $('#company_table tbody tr#' + company_name).children()
                    .css('background-color', '')
                    .css('opacity', '');
            });
        } else add_company(company, function(err) {
            //if (err) return;
            
            model.update_charts();
            d3.select('div#visulaization_slide div.secondary_div')
                .append('h3')
                .attr('class', 'company_label')
                .attr('id', company)
                .attr('title', company)
                .style('color', function() {
                    return model.get_color(company);
                })
            .text(company)
            .on('click', function() {
                click_company(company);
            });

            $('#company_table tbody tr#' + company.replace('.', '\\.'))
                .children()
                .css('background-color', model.get_color(company))
                .css('opacity', '0.7');    
        });
    });
}
