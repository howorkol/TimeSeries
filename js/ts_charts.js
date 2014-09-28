var init_attribute = '1';
var disable_slides = true;
var min_chart_height = 150;
var company_list;
var attribute_list;
var comp_data;
var query_part = 'https://quandl.com/api/v1/multisets.csv?columns=';

var total = 0;
var test_data = [
    {'Date': "2014-09-26", 'Value': "9.55"},
    {'Date': "2014-09-27", 'Value': "47.55"},
    {'Date': "2014-09-28", 'Value': "6.55"}
];

function add_company(comp_name, callback) {
    var query = '';
    
    for (i in attribute_list) {
        query += 'WIKI.' + comp_name + '.' + attribute_list[i] + ',';
    }
    query = query.substring(0, query.length - 1);
    
    d3.csv(query_part + query, function(err, data) {
        if (err) {
            
        } else {
            company_list.push(comp_name);
            
            comp_data[init_attribute] = [{
                'Company' : comp_name,
                'Data': data
            }];
            
            if (company_list.length == 1) {
                // Need to create the first chart.
                make_chart(init_attribute, function() {
                    update_charts(callback);
                });
            } else {
                update_charts(callback);
            }
        }
    });
}

function delete_company() {
    
}

function add_attribute(attr_name, callback) {
    attribute_list.push(attr_name);
    comp_data[attr_name] = {};
    // Need to query quandl and get data for the new attribute
    // for all existing companies.
    
    for (company in company_list) {
        comp_data[attr_name][company_list[company]] = null;
    }
    
    make_chart(attr_name, callback);
}

function delete_attribute(li_element, chart_id) {
    li_element.remove();
    var i = attribute_list.indexOf(chart_id);
    attribute_list.splice(i, 1);
    delete comp_data[chart_id];
    update_chart_height();
}

function make_chart(attribute, callback) {
    chart_height = update_chart_height();
    
    if (attribute_list.length > 1) {
        console.log('add');
        $('div#visualizations ul').sortable('option', 'disabled', false);
    }
    
    var margin = {top: 20, right: 25, bottom: 20, left: 50},
        width  = $('div#visualizations').width() - margin.left - margin.right,
        height = chart_height - margin.top - margin.bottom;
    
    var svg = d3.select('div#visualizations ul')
        .append('li')
        .append('svg')
        .attr('class', 'chart')
        .attr('id', attribute)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");
    
    // Line wont be here
    var line = d3.svg.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Value); });
    
    // These wont be added here. Should be added in update charts.
    var data = comp_data[attribute][0]['Data'];
    
    data.forEach(function(d) {
        d.Date = parseDate(d.Date);
        d.Value = +d['WIKI.AAPL - Open'];
    });
    
    // We will need to set the axis isn update charts. Can add them here, 
    // but call them there.
    x.domain(d3.extent(data, function(d) { return d.Date; }));
    y.domain(d3.extent(data, function(d) { return d.Value; }));
    
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
    
    // These wont be added here. Should be added in update charts.
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
    
    total++;
    callback();
}

function update_charts(callback) {
    // Go through the comp_data var and update all charts with the 
    // data from all companies.
    
    callback();
}

function update_chart_height() {
    var total_height = $('div#visualizations').height();
    
    // Calculate the new chart height.
    chart_height = ((total_height / attribute_list.length) > min_chart_height)
            ? total_height / attribute_list.length
            : min_chart_height;
    
    // Resize each svg element to fit the resized chart.
    d3.selectAll('svg.chart')
        .attr('height', chart_height);
    /*
    // Go through all existing charts and make them the new height.
    d3.selectAll('svg.chart rect')
        .attr('height', chart_height);*/
    
    return chart_height;
}

   