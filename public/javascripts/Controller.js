var chart_height;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var clicked_companies = [];

function add_industry(sector, callback) {
    d3.json('/sector/' + sector, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        model.add_company('Average', data.average, data.companies);
        
        d3.select('div#visulaization_slide div.secondary_div').append('h3')
            .attr('class', 'company_label')
            .attr('id', 'Average')
            .attr('title', sector + ' Average')
            .style('color', model.get_color('Average'))
            .text('Average')
            .on('click', function() {
                click_company('Average');
            });
        
        callback(null);
    });
}

function add_company(company, callback) {
    company = company.toUpperCase();
    
    if (model.company_present(company)) {
        callback('err');
        return;
    }
    
    d3.json('/query/' + company, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
       
        // Add the data to the model.
        model.add_company(company, data);
        
        // Add the company title to the legend.
        d3.select('div#visulaization_slide div.secondary_div').append('h3')
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
        
        callback(null);
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
/*
function hover_company_name(company) {
    d3.selectAll('g.chart path#' + company)
        .classed('hovered', true)
        .moveToFront();
}

function remove_company_hover(company) {
    d3.selectAll('g.chart path#' + company)
        .classed('hovered', false);
}
*/
function delete_company(company_name, callback) {
    model.delete_company(company_name);
    $('h3.company_label#' + company_name).remove();
    $('#company_table tbody tr#' + company_name).children()
        .css('background-color', '')
        .css('opacity', '');
    callback();
}

d3.selection.prototype.moveToFront = function() {
    // Info found here 
    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    return this.each(function() {
        var par = this.parentNode;
        par.parentNode.appendChild(par);
    });
};

function update_company_table(all_companies) {
    for (var i = 0; i < all_companies.length; i++) {
        var data = all_companies[i];
        var html = '<tr id="' + data.tickersymbol + '"><td>' + data.companyname + 
                '</td><td>' + data.tickersymbol + '</td><td>' + data.industry + 
                '</td><td>' + data.sector + '</td><td>' + data.consecutiveyears + '</td></tr>';
        $('#company_table tbody').append(html);
        $('#company_table').trigger('update');
    }
    
    $('#company_table tbody tr').click(function() {
        var row = $(this);
        var company = row.attr('id');
        
        add_company(company, function(err) {
            if (err) {
                delete_company(company, function() {});
            } else {
                
            }
        });
    });
}
