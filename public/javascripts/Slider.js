var curr_slider_attribute;

var s_x = d3.time.scale(),
    s_y = d3.scale.linear();

var s_xAxis;

var s_line = d3.svg.line()
        .defined(function(d) { return d['value'] != null; })
        .x(function(d) { return s_x(d['date']); })
        .y(function(d) { return s_y(d['value']); });

var brush;
var svg;

/*
    Creates a new slider. Used as a focus and context for all charts.
    All charts share the same domain, so one slider updates them all.
    This function is only called once upon the first chart creation.
*/
function create_slider() {
    curr_slider_attribute = init_attribute;
    
    // When a brush event occurs, call the 'brushed' function.
    brush = d3.svg.brush('div#slider').x(s_x)
        .on("brush", function() {
            model.slider_event();
        });
    
    // Get the width and height for the slider.
    var s_width = $(chart_container).width() - margin.left - margin.right;
    var s_height = $('div#slider').height() - margin.top - margin.s_bottom;
    
    // Set the domain and range for the slider.
    s_x.domain(model.date_range())
        .range([1, s_width]);
    s_y.domain(model.value_range(curr_slider_attribute))
        .range([s_height, 1]);
    
    // The slider doesn't have a yAxis, so set the attributes
    // for the xAxis.
    s_xAxis = d3.svg.axis().scale(s_x).orient("bottom")
    
    // Create and append the svg element. All slider element are 
    // contained within.
    svg = d3.select('div#slider')
        .append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height',  $('div#slider').height())
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    // Create and append the xAxis.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + s_height + ")")
        .call(s_xAxis);
    
    // Create and append the brush.
    svg.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", s_height + 7);
    
    update_slider();
}

/*  
    Function to handle all updates to the slider.
    Updates are mostly limited to adding/removing a company from the data.
*/
function update_slider(top_element) {
    // top_element is set to the new top-most chart when a chart has been 
    // removed. If curr_slider_attribute is still the top-most chart, 
    // return. Otherwise, remove all lines from the chart and set the new
    // curr_slider_attribute. If top_element unset, ignore.
    var extent = brush.extent();
    if (top_element === curr_slider_attribute) return;
    else if (top_element) {
        svg.selectAll('g.company').remove();
        curr_slider_attribute = top_element;
    }
    
    var s_height = $('div#slider').height() - margin.top - margin.s_bottom;
    
    // Set the slider domain and range as it may have changed. 
    s_x.domain(model.date_range());
    s_y.domain(model.value_range(curr_slider_attribute));
    
    var companies = svg.selectAll('g.company')
        .data(model.data[curr_slider_attribute], function(d) {
            return d.company;
        });
    // Enter the data. Applies to newly added lines.
    var enter = companies.enter()
        .append('g').attr('class', 'company')
        .append('path').attr('class', 'line')
        .attr('id', function(d) { return d.company; })
        .attr('d', function(d) { return s_line(d.values); })
        .attr('stroke', function(d) {
            if ((selected_company == null) || (selected_company == d.company))
                return d.color;
            else return deselected_color;
        })
        .attr('stroke-opacity', 0);
    // Applied to all lines.
    companies.selectAll('path')
        .transition().duration(500)
        .attr('d', function(d) { return s_line(d.values); })
        .attr('stroke-opacity', 1);
    // Remove lines that no longer have data.
    companies.exit().remove();
    
    // Update the xAxis.
    svg.select('g.axis')
        .transition().duration(500)
        .call(s_xAxis);
    
    // The brush maintains the same extent on the slider.
    brush.extent(extent);
    brush(d3.select('.brush').transition().duration(500));
    model.update_charts();
}