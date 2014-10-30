var slider = {};
var curr_slider_attribute;

var s_x = d3.time.scale(),
    s_y = d3.scale.linear();

var s_xAxis;

var s_line = d3.svg.line()
        .defined(function(d) { return d[1] != null; })
        .x(function(d) { return s_x(d[0]); })
        .y(function(d) { return s_y(d[1]); });

var brush;

/*
    Creates a new slider. Used as a focus and context for all charts.
    All charts share the same domain, so one slider updates them all.
    This function is only called once upon the first chart creation.
*/
function create_slider() {
    curr_slider_attribute = init_attribute;
    
    // When a brush event occurs, call the 'brushed' function.
    brush = d3.svg.brush('div#slider')
        .x(s_x)
        .on("brush", brushed);
    
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
    slider.svg = d3.select('div#slider')
        .append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height',  $('div#slider').height())
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    // Create and append the xAxis.
    slider.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + s_height + ")")
        .call(s_xAxis);
    
    // Create and append the brush.
    slider.svg.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", s_height + 7);
    
    // Whenever a 'brush' event occurs call update_chart_domain.
    // This will update the domains of all charts on the page.
    function brushed() {
        model.update_chart_domain(brush.empty() ? model.date_range() : brush.extent());
    }
}

/*
    The slider represents a smaller version of the chart at the
    top of the page. As the user moves charts around, the slider
    is always updated to show the top chart.
*/
function update_slider(new_attr) {
    if (new_attr == curr_slider_attribute) return;
    curr_slider_attribute = new_attr;
    
    // Remove all lines from the slider.
    slider.svg.selectAll('path').remove();
    
    // Go through all the data for the new top attribute, adding
    // lines for each company to the slider.
    for (index in model.get_company_list()) {
        var company_name = model.get_company_name(index);
        // Create and append a new line for this company.
        slider.svg.append('path')
            .datum(model.get_data(new_attr, company_name))
            .attr('class', 'line')
            .attr('id', company_name)
            .attr('d', s_line)
            .attr('stroke', model.get_color(company_name))
            .attr('stroke-opacity', 0)
            .transition()
            .duration(500)
            .attr('stroke-opacity', 1);
    }
}

/*
    The slider domain needs to represent the full range of x values
    for every attribute currently shown. When a new company is added
    it may have data going further into the past than any currently 
    shown. The slider is updated to reflect this.
*/
function update_slider_domain() {
    var extent = brush.extent();
    var s_height = $('div#slider').height() - margin.top - margin.s_bottom;
    
    // Set the slider domain and range. 
    s_x.domain(model.date_range());
    s_y.domain(model.value_range(curr_slider_attribute));
    
    // Update all lines currently on the slider to reflect to domain
    // changes.
    slider.svg.selectAll('.line')
        .transition()
        .duration(500)
        .attr('d', s_line);
    
    // Update the xAxis to reflect the domain change.
    slider.svg.select('.axis')
        .transition()
        .duration(500)
        .call(s_xAxis);

    // The brush maintains the same extent on the slider.
    brush.extent(extent);
    brush(d3.select(".brush").transition().duration(500));
}

/*
    This function adds a company to the slider. The data
    used it for company_name, and curr_slider_attribute.
*/
function slider_add_company(company_name) {
    slider.svg.append('path')
        .datum(model.get_data(curr_slider_attribute, company_name))
        .attr('class', 'line')
        .attr('id', company_name)
        .attr('d', s_line)
        .attr('stroke', model.get_color(company_name))
        .attr('stroke-opacity', 0)
        .transition()
        .duration(500)
        .attr('stroke-opacity', 1);
}

/*
    Remove company_name from the slider.
*/
function slider_remove_company(company_name) {
    d3.select('div#slider path#' + company_name).remove();
}