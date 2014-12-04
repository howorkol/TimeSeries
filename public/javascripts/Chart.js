var chart_container = 'div#visualizations div#charts ul';
var margin = {top: 3, right: 0, bottom: 15, left: 65, s_bottom: 20};

var Chart = function(attribute) {
    this.attribute = attribute;
    this.svg = d3.select(chart_container).append('svg');
    this.set_height();
    this.make_chart();
};

Chart.prototype.min_chart_height = 150;
Chart.prototype.x = d3.time.scale();
Chart.prototype.width;
Chart.prototype.height;
Chart.prototype.transition_dur = 500;

Chart.prototype.set_hover_values = function(x0) {
     for (var i = 0; i < model.get_num_companies(); i++) {
        var curr_company = model.get_company_by_index(i);
        this.svg.select('g#' + curr_company + ' .yValue')
            .text(model.getYatX(this.attribute, curr_company, x0));
    }
}

/*
    Create a new chart and add it to the page.
    The new chart will be created with the correct height as well as 
    display the same domain of values that is set by the slider.
*/
Chart.prototype.make_chart = function() {
    // Get the width and height that the new chart will take. 
    this.width = $(chart_container).width();
    var chart_height = this.height - margin.top - margin.bottom;
    var chart_width = this.width - margin.left - margin.right;
    var attribute = this.attribute;
    
    var cursor_out = function() {
        d3.selectAll('line.xLine').style('opacity', 0);
        d3.selectAll('g .yValue, text#xDate').text('');
    }
    
    // Create the svg element to hold everything.
    this.svg.attr('width',  $(chart_container).width())
        .attr('height', this.height);
    
        /*.on('mousemove', function() {
            var x_coor = d3.mouse(this)[0] - margin.left - 1;
            var y_coor = d3.mouse(this)[1] - margin.top - 27;
            var x0 = x.invert(x_coor);
            
            if ((x_coor < 0) || (y_coor < 0) || (being_sorted)) {
                cursor_out();
                return null;
            }

            d3.selectAll('line.xLine').style('opacity', 1)
                .attr('transform', 'translate(' + (margin.left + x(x0)) + 
                      ',' + (margin.top + 25) + ')');
            d3.selectAll('text#xDate').text(d3.time.format('%a %b %d %Y')(x0));

            model.chart_hover(x0);
        
        }).on('mouseleave', cursor_out);*/
    
    // The clip path area is where is chart is allowed to show through.
    // When the user selects an area with the slider, the line widths are
    // extended outside the bounds of the chart. The clip path ensures
    // those parts of the lines can't be seen.
    this.svg.append("defs").append("clipPath")
        .attr("id", 'clip_' + this.attribute)
        .append("rect")
        .attr("width", chart_width)
        .attr("height", chart_height + margin.top);    
    
    // Group everything in the chart for easy access. 
    this.chart_group = this.svg.append('g')
        .attr('class', 'chart')
        .attr('id', this.attribute)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = this.x.range([1, chart_width]);
    
    // Grab and set the y domain and range. The domain depends on the 
    // data for this attribute, range depends on chart height.
    var y = this.y = d3.scale.linear()
        .range([chart_height, 25]).nice();
    
    this.line = d3.svg.line()
        .defined(function(d) { return d['value'] != null; })
        .x(function(d) { return x(d['date']); })
        .y(function(d) { return y(d['value']); });
    
    // Set the attributes for the x and y axis.
    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom')
        .tickSize(-chart_height, 0, 0);
    this.yAxis = d3.svg.axis().scale(this.y).orient('left')
        .tickSize(-chart_width, 0, 0).ticks(5);
    
    // Append the x axis.
    this.chart_group.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + chart_height + ')');
    
    // Append the y axis.
    this.chart_group.append('g')
        .attr('class', 'y axis')
        .append('text')
        .attr('transform', 'rotate(-90), translate(' + 
              (((-chart_height) / 2) + 12) + ',0)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .text(this.attribute);

    // Create and append a line group. Used for easy access to
    // the lines of this attribute. Clip path is set.
    this.line_group = this.chart_group.append('g')
        .attr('class', 'line_group')
        .attr('clip-path', 'url(#clip_' + this.attribute + ')');
    
    this.svg.append('line')
        .attr('class', 'xLine')
        .style('opacity', 0)
        .attr('y1', 0)
        .attr('y2', chart_height - 25);
    
    this.svg.append('text')
        .attr('id', 'xDate')
        .attr('font-size', '.9em')
        .attr('transform', 'translate(' + (chart_width + margin.left - 6) + ', 20)')
        .attr('text-anchor', 'end');
    
    //this.update_chart();
}

Chart.prototype.update_chart = function() {
    var chart_height = this.height - margin.top  - margin.bottom;
    var chart_width  = this.width  - margin.left - margin.right;
    var line = this.line;

    // Set the chart domain and range as it may have changed. 
    /*this.x.domain(brush.empty() 
            ? model.date_range() 
            : brush.extent());*/
    this.x.domain(model.date_range());
    this.y.domain(model.value_range(this.attribute))
        .range([chart_height, 25]).nice();
    
    var companies = this.line_group.selectAll('g.company')
        .data(model.data[this.attribute], function(d) {
            return d.company;
        });
    // Enter the data. Applies to newly added lines.
    var enter = companies.enter()
        .append('g').attr('class', 'company');
    
    enter.append('path').attr('class', 'line')
        .attr('id', function(d) { return d.company; })
        .attr('d', function(d) { return line(d.values); })
        .attr('stroke', function(d) { 
            return d.color;
        })
        .attr('stroke-opacity', 0);
    
    var yValue_group = enter.append('g').attr('class', 'yValue_group')
        .attr('id', function(d) { return d.company; })
        .attr('fill', function(d) { 
            return d.color;
        })
        .attr('font-size', '.9em');
    
    yValue_group.append('text')
        .text(function(d) { return d.company; });
    yValue_group.append('text')
        .attr('class', 'yValue')
        .attr('transform', 'translate(0, 13)')
        .attr('fill', 'black');
    
    // Applied to all lines.
    companies.selectAll('path')
        .transition().duration(500)
        .attr('d', function(d) { return line(d.values); })
        .attr('stroke-opacity', 1);
    companies.selectAll('.yValue_group')
        .transition().duration(500)
        .attr('transform', function(d) {
            var i = model.company_index(d.company);
            if (i == 0) {
                return 'translate(' + (chart_width - 10) + ',10)';
            } else {
                return 'translate(' + ((i - 1) * chart_width / 10) + ',10)';
            }
        }).attr('text-anchor', function(d) {
            if (model.company_index(d.company) == 0)
                return 'end';
        });
    
    // Remove lines that no longer have data.
    companies.exit().remove();
    
    // Update the axes.
    this.xAxis.tickSize(-(this.height - margin.top - margin.bottom) + 25, 0, 0);
    this.chart_group.select(".x.axis")
        .transition().duration(500)
        .attr('transform', 'translate(0,' + (this.height - margin.top - margin.bottom) + ')')
        .call(this.xAxis);
    this.chart_group.select('.y.axis')
        .transition().duration(this.transition_dur)
        .call(this.yAxis);
    this.chart_group.select('.y.axis > text')
        .transition().duration(this.transition_dur)
        .attr('transform', 'rotate(-90), translate(' + 
             (((-chart_height) / 2) - 12) + ', -65)');
}

Chart.prototype.quick_update = function() {
    var line = this.line;
    this.x.domain(brush.empty() 
            ? model.date_range() 
            : brush.extent());
    
    this.line_group.selectAll('g.company path')
        .attr('d', function(d) { return line(d.values); });
    this.chart_group.select(".x.axis")
        .call(this.xAxis);
}

/*
    Update the height of all charts. This function is called when a
    chart is added or removed to allow dynamic chart sizes.
*/
Chart.prototype.update_chart_height = function() {
    // Get and set the y range to reflect the new height.
    var y = this.y.range([this.height - margin.top - margin.bottom, 25]).nice();
    var x = this.x;
    var line = this.line;
    
    // Update the svg height.
    this.svg.transition().duration(this.transition_dur)
        .attr('height', this.height);
    // Update the clip path height.
    this.svg.select('defs rect')
        .transition().duration(this.transition_dur)
        .attr('height', this.height - margin.bottom);
    // Update xLine
    this.svg.select('line.xLine')
        .transition().duration(this.transition_dur)
        .attr('y2', this.height - margin.top - margin.bottom - 25);
};

/*
    Sets the height of the Chart prototype variable. Since all charts
    have the same height, they all use the same shared variable.
*/
Chart.prototype.set_height = function() {
    var total_height = $('div#visualizations div#charts').height();
    Chart.prototype.height = ((total_height / 2/*model.get_num_attributes()*/) > this.min_chart_height)
            ? (total_height / 2/*model.get_num_attributes()*/) - 7
            : this.min_chart_height;
};