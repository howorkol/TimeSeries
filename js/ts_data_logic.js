var init_attribute = '1';
var disable_slides = true;
var chart_height;
var min_chart_height = 150;
var company_list;
var attribute_list;
var color_list = [
    'red', 'blue', 'green', 'steelblue'
];
var comp_data;
var charts = {};
var query_part = 'https://quandl.com/api/v1/multisets.json?columns=';
var auth_token = '&auth_token=WczNwgPepRcbZR9Yf7qt';

var parseDate = d3.time.format("%Y-%m-%d").parse;

var total = 0;


function add_company(company_name, callback) {
    
    if (attribute_list.length == 0) {
        // This is the first attribute to be added.
        // Build the query to send to Quandl
        var query = query_part;
        query += 'WIKI.' + company_name + '.' + init_attribute + auth_token;
        
        // Query Quandl
        d3.json(query, function(err, data) {
            if (err) callback(err);
            
            // Go thru the response. Parse the date and value.
            data.data.forEach(function(d) {
                d[0] = parseDate(d[0]);
                d[1] = +d[1];
            });
            
            attribute_list.push(init_attribute);
            company_list.push(company_name);
            // Add the response data to the data structure.
            comp_data[init_attribute] = {};
            comp_data[init_attribute][company_name] = data.data;
            
            //chart_height = update_chart_height();
            //make_chart(init_attribute, callback);
            charts[init_attribute] = new Chart(init_attribute);
            total++;
            callback();
        });
    } else {
        // This is not the first company.
        // Build the query to send to Quandl
        var query = query_part;
        for (a in attribute_list) {
            query += 'WIKI.' + company_name + '.' + attribute_list[a] + ',';
        }
        query = query.substring(0, query.length - 1);
        query += auth_token;
        
        // Query Quandl
        d3.json(query, function(err, data) {
            if (err) callback(err);
            
            // Go thru the response. Parse the date and value.
            data.data.forEach(function(d) {
                d[0] = parseDate(d[0]);
                for (var i = 1; i <= attribute_list.length; i++) {
                    if (d[i] !== null) {
                        d[i] = +d[i];
                    }
                }
            });
            
            company_list.push(company_name);
            // Add the response data to the data structure.
            for (var i in attribute_list) {
                comp_data[attribute_list[i]][company_name] = 
                        data.data.map(function(d) {
                    return [d[0], d[parseInt(i) + 1]];
                });
            }
            
            for (chart in charts) {
                charts[chart].update_chart_lines();
            }
            callback()
        });
    }
    
}

function delete_company(company_name, callback) {
    var i = company_list.indexOf(company_name);
    
    // If the company isn't in company list, callback() with err.
    if (i == -1) {
        callback('err');
        return;
    }
    
    // Go through the data structure and delete data from this company.
    for (var j in attribute_list) {
        delete comp_data[attribute_list[j]][company_name];
    }
    
    // Remove the company from company_list.
    company_list.splice(i, 1);
}

function add_attribute(attr_name, callback) {
    // A new attribute has been added.
    // Build the query to send to Quandl.
    var query = query_part;
    for (c in company_list) {
        query += 'WIKI.' + company_list[c] + '.' + attr_name + ',';
    }
    query = query.substring(0, query.length - 1);
    query += auth_token;
    
    // Query Quandl.
    d3.json(query, function(err, data) {
        if (err) callback(err);
        
        // Go thru the response. Parse the date and value.
        data.data.forEach(function(d) {
            d[0] = parseDate(d[0]);
            for (var i = 1; i <= company_list.length; i++) {
                if (d[i] !== null) {
                    d[i] = +d[i];
                }
            }
        });
        
        attribute_list.push(attr_name);
        // Add the response data to the data structure.
        comp_data[attr_name] = {};
        for (var i in company_list) {
            comp_data[attr_name][company_list[i]] = 
                    data.data.map(function(d) {
                return [d[0], d[parseInt(i) + 1]];
            });
        }
        
        charts[attr_name] = new Chart(attr_name);
        for (chart in charts) {
            charts[chart].update_chart_height();
        }
        
        $('div#visualizations ul').sortable('option', 'disabled', false);
        
        total++;
        callback();
    });
    
}

function delete_attribute(li_element, chart_id) {
    // Remove html node from page.
    li_element.remove();
    
    // Remove the attribute from the attribute list.
    var i = attribute_list.indexOf(chart_id);
    attribute_list.splice(i, 1);
    
    // Delete the data for that attribute, as well as the chart.
    delete comp_data[chart_id];
    delete charts[chart_id];
    
    // Go through the remaining charts and update their heights.
    Chart.prototype.set_height();
    for (chart in charts) {
        charts[chart].update_chart_height();
    }
}
