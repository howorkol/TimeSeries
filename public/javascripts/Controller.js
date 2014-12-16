var chart_height;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var clicked_companies = [];

function add_industry(sector, callback) {
    //model.add_company('Average');

    d3.json('/sector/' + sector, function(err, data) {
        if (err) return callback(err);
        update_company_table(data.companies);
        /*model.add_db_data('Average', data.average, data.companies);
        
        d3.select('div#visulaization_slide div.secondary_div').append('h3')
            .attr('class', 'company_label')
            .attr('id', 'Average')
            .attr('title', sector + ' Average')
            .style('color', model.get_color('Average'))
            .text('Average')
            .on('click', function() {
                click_company('Average');
            });
        */
        callback(null);
    });
}

function add_company(company, callback) {
    var success = 0;
    company = company.toUpperCase();
    model.add_company(company);
    
    d3.json('/query/' + company, function(err, data) {
        if (err) return callback(err);
        console.log(data);
        model.add_db_data(company, data);
        if (++success === 2) return callback(null);
    });

    query = 'https://www.quandl.com/api/v1/datasets/WIKI/' + company +
            '.json?collapse=annual&auth_token=WczNwgPepRcbZR9Yf7qt'

    d3.json(query, function(err, data) {
        if (err) return callback(err);
        data = data.data.map(function(d) {
            return {'Date': d[0], 'Close': d[4], 'Volume': d[5]};
        });
        model.add_quandl_data(company, data);
        if (++success === 2) return callback(null);
    });
}

function click_company(company) {
    if (clicked_companies.indexOf(company) === -1) {
        clicked_companies.push(company);
        d3.selectAll('g.chart path#' + company)
            .classed('deselected', true)
            .moveToFront();
    } else {
        var index = clicked_companies.indexOf(company);
        clicked_companies.splice(index, 1);
        d3.selectAll('g.chart path#' + company)
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
                $('h3.company_label#' + company_name).remove();
                $('#company_table tbody tr#' + company_name).children()
                    .css('background-color', '')
                    .css('opacity', '');
            });
        } else add_company(company, function(err) {
            if (err) return;
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

            $('#company_table tbody tr#' + company).children()
                .css('background-color', model.get_color(company))
                .css('opacity', '0.7');    
        });
    });
}
