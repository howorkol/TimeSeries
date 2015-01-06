var parseDate = d3.time.format("%Y-%m-%d").parse;
var clicked_companies = [];
var disable_slides = true;
var query_part = [ 'https://www.quandl.com/api/v1/datasets/WIKI/',
                   '.json?collapse=annual&auth_token=WczNwgPepRcbZR9Yf7qt' ]

/*
 * Initialize liteAccordion
 */
$('#accordion_cont').liteAccordion({
    containerWidth: $(window).width() - 23,
    containerHeight: $(window).height() - 13,
    slideSpeed: 500,
    theme : 'light'
});

/*
 * Initialize tablesorter
 */
$(".tablesorter").tablesorter();

/*
 * Initialize the sector list on the starting slide. 
 * Grabs the list of sectors from the server.
 */
d3.json('/query/sectors', function(err, data) {
    if (err) {
        //callback(err);
        return false;
    }

    d3.select('ul#sector_list')
        .selectAll('li.sector').data(data.map(function(d) { return d.sector; }))
        .enter().append('li')
        .attr('class', 'sector')
        .text(function(d) { return d; })
        .on('click', function(d) { new_sector(d); });
});

/* 
 * When the user clicks 'browse all'. 
 */
$('div#listbox span#browse').click(function() {
    new_sector('All');
});

/*
 * Add a new sector to the companies slide.
 * Wipe everything from a previous sector.
 */
function new_sector(sector) {
    $('div#visualizations ul svg').remove();
    $('h3.company_label').remove();
    $('#company_table tbody tr').remove();
    model = new Model();

    d3.json('/query/sector/' + sector, function(err, data) {
        if (err) {
            console.log('No data for ' + sector);
            return false;
        }
        
        // Set the company table to hold the new list of companies
        // and switch slides to the table.
        update_company_table(data);
        disable_slides = false;
        $('h1.industry_name').text(sector);
        $('ol li:nth-child(2) span').click();
    });
}

/*
 * Don't switch slides when no sector is chosen yet.
 */
$('span.slide_title').click(function() {
    if (disable_slides === true) { return false; }
});

/* 
 * Function to add a new company to the charts.
 * Since we are getting data from two sources (local db & Quandl), we need to
 * get the results from both before adding anything to the charts. Otherwise
 * an error occurs when we try to add a second company before the first 
 * query returns.
 */
function add_company(company, callback) {
    var success = 0;
    var quandl_data;
    var db_data;
    company = company.toUpperCase();
    
    // Query the local db for dividends paid and % change
    d3.json('/query/company/' + company, function(err, data) {
        if (err) return callback(err);
        db_data = data;
        if (++success === 2) done();
    });

    // Query Quandl for Close and Volume
    d3.json(query_part[0] + company + query_part[1], function(err, data) {
        if (err) console.log('No data for ' + company + ' from Quandl.');
        else data = data.data.reverse().map(function(d) {
                return {'Date': d[0], 'Close': d[4], 'Volume': d[5]};
            });
        
        quandl_data = data;
        if (++success === 2) done();
    });

    // Once both queries are done add the data to the model.
    function done() {
        model.add_company(company);
        model.add_db_data(company, db_data);
        model.add_quandl_data(company, quandl_data);
        return callback(null);
    }
}

/*
 * Function to handle when a company is clicked.
 * The lines corresponding to the company are dimmed. Charts also resize to 
 * zoom in on the remaining lines.
 */ 
function click_company(company) {
    company = company.replace('.', '\\.');
    if (clicked_companies.indexOf(company) === -1) {
        clicked_companies.push(company);
        d3.select('h3#' + company).classed('deselected', true);
        d3.selectAll('g.chart path#' + company).classed('deselected', true)
            .moveToFront();
    } else {
        var index = clicked_companies.indexOf(company);
        clicked_companies.splice(index, 1);
        d3.select('h3#' + company).classed('deselected', false);
        d3.selectAll('g.chart path#' + company).classed('deselected', false);
    }
    model.update_charts();
}

/*
 * Function to delete a company from the charts. 
 */
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
