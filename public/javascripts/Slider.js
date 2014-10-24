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

function create_slider() {
    curr_slider_attribute = init_attribute;
    
    brush = d3.svg.brush('div#slider')
        .x(s_x)
        .on("brush", brushed);
    
    
    var s_width = $(chart_container).width() - margin.left - margin.right;
    var s_height = $('div#slider').height() - margin.top - margin.s_bottom;
    
    s_x.domain(model.date_range())
        .range([1, s_width]);
    s_y.domain(model.value_range(curr_slider_attribute))
        .range([s_height, 1]);
    
    s_xAxis = d3.svg.axis().scale(s_x).orient("bottom")
    
    slider.svg = d3.select('div#slider')
        .append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height',  $('div#slider').height())
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    slider.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + s_height + ")")
        .call(s_xAxis);
    
    slider.svg.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", s_height + 7);
    
    function brushed() {
        console.log('brush');
        model.update_chart_domain(brush.empty() ? model.date_range() : brush.extent());
        //this.svg.select(".x.axis").call(xAxis);
    }
}

function update_slider(new_attr) {
    if (new_attr == curr_slider_attribute) return;
    // Need to update the slider to show the top chart.
    curr_slider_attribute = new_attr;
    
    slider.svg.selectAll('path').remove();
    
    for (index in model.get_company_list()) {
        var company_name = model.get_company_name(index);
        
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

function update_slider_domain() {
    var extent = brush.extent();
    var s_height = $('div#slider').height() - margin.top - margin.s_bottom;
    
    s_x.domain(model.date_range());
    s_y.domain(model.value_range(curr_slider_attribute));
    
    slider.svg.selectAll('.line')
        .transition()
        .duration(500)
        .attr('d', s_line);
    
    slider.svg.select('.axis')
        .transition()
        .duration(500)
        .call(s_xAxis);

    brush.extent(extent);
    brush(d3.select(".brush").transition().duration(500));
    //ocus.select(".x.axis").call(xAxis);
    //brush.event(d3.select(".brush").transition().duration(500));
    
}

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

function slider_remove_company(company_name) {
    d3.select('div#slider path#' + company_name).remove();
}