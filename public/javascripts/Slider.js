var slider = {};

var s_x = d3.time.scale(),
    s_y = d3.scale.linear();

var s_xAxis;

var s_line = d3.svg.line()
        .defined(function(d) { return d[1] != null; })
        .x(function(d) { return s_x(d[0]); })
        .y(function(d) { return s_y(d[1]); });

var brush;

function create_slider() {
    
    brush = d3.svg.brush('div#slider')
        .x(s_x)
        .on("brush", brushed);
    
    
    var s_width = $(chart_container).width() - margin.left - margin.right;
    var s_height = $('div#slider').height() - margin.top - margin.s_bottom;
    
    s_x.domain(model.date_range())
        .range([1, s_width]);
    s_y.domain(model.value_range(init_attribute))
        .range([s_height, 1]);
    
    s_xAxis = d3.svg.axis().scale(s_x).orient("bottom")
    
    slider.svg = d3.select('div#slider')
        .append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height',  $('div#slider').height())
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    slider.svg.append('path')
        .datum(model.get_data(init_attribute, model.get_company_name(0)))
        .attr('class', 'line')
        .attr('d', s_line)
        .attr('stroke', model.get_color(model.get_company_name(0)));
    
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
        model.update_chart_domain(brush.empty() ? model.date_range() : brush.extent());
    }
}

function update_slider_domain() {
    var extent = brush.extent();
    
    s_x.domain(model.date_range());
    slider.svg.selectAll('.line')
        .transition().duration(500)
        .attr('d', s_line);
    
    slider.svg.select('.axis')
        .transition()
        .duration(500)
        .call(s_xAxis);

    brush.extent(extent);
    brush(d3.select(".brush").transition().duration(500));
    brush.event(d3.select(".brush").transition().duration(500));
}

function slider_add_company() {
    
}