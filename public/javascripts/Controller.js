var chart_height;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var total = 0;

function add_industry(industry, callback) {
    d3.json('/industry/' + industry, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        model.add_company(industry + ' Average', data.average, data.companies);
        
        d3.select('div#visulaization_slide div.secondary_div').append('h3')
            .attr('class', 'company_label')
            .attr('title', industry + ' Average')
            .style('color', model.get_color(industry + ' Average'))
            .text('Average');
        
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
        console.log(data);
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
            .text(company);
            /*.on('click', function() {
                click_company_name(company);
            });*/
        
        $('#company_table tbody tr#' + company)
                .children().css('background-color', model.get_color(company));
        
        callback(null);
    });
}

function delete_company(company_name, callback) {
    model.delete_company(company_name);
    $('h3.company_label#' + company_name).remove();
    $('#company_table tbody tr#' + company_name)
            .children().css('background-color', '');
    callback();
}

d3.selection.prototype.moveToFront = function() {
    // Info found here 
    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function update_company_table(all_companies) {
    for (var i = 0; i < all_companies.length; i++) {
        var data = all_companies[i];
        var html = '<tr id="' + data.tickersymbol + '"><td>' + data.companyname + 
                '</td><td>' + data.tickersymbol + '</td><td>' + data.industry + 
                '</td><td>' + data.noyears + '</td></tr>';
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