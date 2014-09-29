var init_attribute = '1';
var disable_slides = true;
var chart_height;
var min_chart_height = 150;
var company_list;
var attribute_list;
var color_list = [
    'red', 'blue', 'green'
];
var comp_data;
var query_part = 'https://quandl.com/api/v1/multisets.json?columns=';
var auth_token = '&auth_token=WczNwgPepRcbZR9Yf7qt';

//var chart_width = $('div#visualizations').width();
var parseDate = d3.time.format("%Y-%m-%d").parse;

//var template_x = d3.time.scale();
//var template_y = d3.scale.linear();

//var template_xAxis = d3.svg.axis().orient("bottom");
//var template_yAxis = d3.svg.axis().orient("left");

//var margin = {top: 20, right: 25, bottom: 20, left: 50};
//var width =  $('div#visualizations ul').width() - margin.left - margin.right;
//var x = d3.time.scale().range([0, width]);



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
            
            chart_height = update_chart_height();
            //make_chart(init_attribute, callback);
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
                    if (d[i] != '')
                        d[i] = +d[i];
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
            
            console.log(comp_data);
            // update_charts();
            callback()
        });
    }
    
}

function delete_company() {
    
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
                if (d[i] != '')
                    d[i] = +d[i];
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
        
        
        console.log(comp_data);
        
        update_chart_height();
        //make_chart(attr_name, callback);
        total++;
        callback();
    });
    
}

function delete_attribute(li_element, chart_id) {
    li_element.remove();
    var i = attribute_list.indexOf(chart_id);
    attribute_list.splice(i, 1);
    delete comp_data[chart_id];
    update_chart_height();
}

function make_chart(attribute, callback) {
    var margin = {top: 20, right: 25, bottom: 20, left: 50};
    var height = chart_height - margin.top - margin.bottom;
    var width =  $('div#visualizations ul').width() - margin.left - margin.right;
    
    var svg = d3.select('div#visualizations ul')
        .append('li')
        .append('svg')
        .attr("width",  $('div#visualizations').width())
        .attr("height", chart_height)
        .append("g")
        .attr('class', 'chart')
        .attr('id', attribute)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(x).orient('bottom');
    var yAxis = d3.svg.axis().scale(y).orient('left');
    
    var line = d3.svg.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Value); });
    /* NEED TO BE FIXED
    x.domain([
        d3.min(comp_data[attribute], function(d) {
            return d3.min(d.data, function(d2) {
                return d2.Date;
            });
        }), 
        d3.max(comp_data[attribute], function(d) {
            return d3.max(d.data, function(d2) {
                return d2.Date;
            });
        })
    ]);

    y.domain([
        d3.min(comp_data[attribute], function(d) {
            return d3.min(d.data, function(d2) {
                return d2.Value;
            });
        }), 
        d3.max(comp_data[attribute], function(d) {
            return d3.max(d.data, function(d2) {
                return d2.Value;
            });
        })
    ]);
    */
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +  ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(attribute);
    
    for (c in comp_data[attribute]) {
        svg.append("path")
            .datum(comp_data[attribute][c]['data'])
            .attr("class", "line")
            .attr("d", line)
            .attr('stroke', color_list[c]);
    }
    
    total++;
    callback();
}

function update_charts(comp_name, callback) {
    // Couldn't figure out how to update charts. So instead i just delete them
    // all and recreate them. Could be made a lot better.
    $('ul li').remove();
    for (i in attribute_list) {
        make_chart(attribute_list[i], function() {});
    }
    
    
}

function update_chart_height() {
    var total_height = $('div#visualizations').height();
    
    // Calculate the new chart height.
    chart_height = ((total_height / attribute_list.length) > min_chart_height)
            ? total_height / attribute_list.length
            : min_chart_height;
    
    // Resize each svg element to fit the resized chart.
    //d3.selectAll('svg.chart')
    //    .attr('height', chart_height);
    /*
    // Go through all existing charts and make them the new height.
    d3.selectAll('svg.chart rect')
        .attr('height', chart_height);*/
    
    return chart_height;
}

   