var init_attribute = '1';
var disable_slides = true;
var chart_height;
var query_part = 'https://quandl.com/api/v1/multisets.json?collapse=monthly&columns=';
var auth_token = '&auth_token=WczNwgPepRcbZR9Yf7qt';
var parseDate = d3.time.format("%Y-%m-%d").parse;
var total = 0;
var model = new Model();

function add_company(company_info, callback) {
    
    if (model.get_num_attributes() == 0) {
        // This is the first company being added.
        total = 1;
        
        var query = query_part;
        query += 'WIKI.' + company_info.ticker + '.' + init_attribute + auth_token;
        
        d3.json(query, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            
            data.data.forEach(function(d) {
                d[0] = parseDate(d[0]);
                d[1] = +d[1];
            });
            
            model.add_attribute(init_attribute);
            model.add_company(company_info.ticker, data.data);
            model.add_chart(init_attribute);
            
            $('div#visulaization_slide div.secondary_div').append(
                '<p class="company" style="color:' + model.get_color(company_info.ticker)
                    + '" title="' + company_info.name + '">' + company_info.ticker + '</p>'
            );
            total++;
            
            callback(null);
        });
    } else {
        // This is not the first company being added.
        var query = query_part;
        for (a in model.attribute_list) {
            query += 'WIKI.' + company_info.ticker + '.' + model.attribute_list[a] + ',';
        }
        query = query.substring(0, query.length - 1);
        query += auth_token;
        
        d3.json(query, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            
            // Go thru the response. Parse the date and value.
            data.data.forEach(function(d) {
                d[0] = parseDate(d[0]);
                for (var i = 1; i <= model.get_num_attributes(); i++) {
                    if (d[i] !== null) {
                        d[i] = +d[i];
                    }
                }
            });
            
            model.add_company(company_info.ticker, data.data);
            
            $('div#visulaization_slide div.secondary_div').append(
                '<p class="company" style="color:' + model.get_color(company_info.ticker)
                    + '" title="' + company_info.name + '">' + company_info.ticker 
                    + '<i id="' + company_info.ticker + '" class="fa fa-times"></i></p>'
            );
        
            // Add a click listener to the new element.
            $('p.company i#' + company_info.ticker).click(function() {
                var comp = $(this).attr('id');
                
                delete_company(comp, function() {
                    $('p.company i#' + comp).parent().remove();
                });
            });
            
            callback(null);
        });
    }
}

function delete_company(company_name, callback) {
    model.delete_company(company_name);
    callback();
}

function add_attribute(attribute_name, callback) {
    // User adds a new attribute.
    var query = query_part;
    for (c in model.company_list) {
        query += 'WIKI.' + model.company_list[c] + '.' + attribute_name + ',';
    }
    query = query.substring(0, query.length - 1);
    query += auth_token;
    
    d3.json(query, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        // Go thru the response. Parse the date and value.
        data.data.forEach(function(d) {
            d[0] = parseDate(d[0]);
            for (var i = 1; i <= model.get_num_attributes(); i++) {
                if (d[i] !== null) {
                    d[i] = +d[i];
                }
            }
        });
        
        model.add_attribute(attribute_name, data.data);
        model.add_chart(attribute_name);
        $('div#visualizations ul').sortable('option', 'disabled', false);
        
        total++;
        callback(null);
    });
}

function delete_attribute(li_element, attribute_name, callback) {
    // Remove html node from page.
    li_element.remove();
    model.delete_attribute(attribute_name);
    callback();
}