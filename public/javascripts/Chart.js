var chart_container = 'div#visualizations div#charts ul';
var margin = {top: 3, right: 1, bottom: 15, left: 65, s_bottom: 20};

/*
 * Constructor
 */
var Chart = function(attribute) {
    this.attribute = attribute;
    this.set_height();
    this.make_chart();
};

Chart.prototype.min_chart_height = 150;
Chart.prototype.width;
Chart.prototype.height;
Chart.prototype.transition_dur = 500;

/*
 * Create an empty chart for this.attribute.
 * The lines and axis are not drawn because the data may not exist yet.
 */
Chart.prototype.make_chart = function() {
    this.width = $(chart_container).width();
    var chart_height = this.height - margin.top - margin.bottom;
    var chart_width = this.width - margin.left - margin.right;
    var attribute = this.attribute;
    var xLine;
    
    var cursor_out = function() {
        d3.selectAll('line.xLine').style('opacity', 0);
        d3.selectAll('g .yValue, text#xDate').text('');
    }
    
    // Create the svg element to hold everything.
    this.svg = d3.select(chart_container).append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height', this.height)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
    
    function mousemove() {
        var x_coor = d3.mouse(this)[0] - margin.left - 1;
        var y_coor = d3.mouse(this)[1] - margin.top - 27;
        
        // If the cursor is outside the chart bounds, mouseout.
        if ((x_coor < 0) || (x_coor > chart_width) || 
                (y_coor < 0) || (y_coor > chart_height)) {
            mouseout();
            return;
        }

        // Invert the x_coor to get the date from the coordinate
        var x0 = x.invert(x_coor);
        var hovered_data = model.getClosestValues(attribute, x0);

        d3.select('g#' + attribute + ' text#xDate')
            .text(d3.time.format('%b %e %Y')(hovered_data.closest_date));

        for (company in hovered_data.values) {
            d3.select('g#' + attribute + ' .yValue_group#' + 
                      company.replace('.', '\\.') + ' .yValue')
                .text(function() {
                    if (hovered_data.values[company] === null) return '';
                    return d3.format('.3r')(hovered_data.values[company]);
                });
        }

        // Set the vertical xLine to the correct coordinates
        xLine.classed('hidden', false)
            .attr('transform', 'translate(' + 
                  (x(hovered_data.closest_date)) + ',0)');
    }
        
    function mouseout() {
        d3.selectAll('text#xDate').text('');
        d3.selectAll('g#' + attribute + ' .yValue_group .yValue')
            .text('');
        xLine.classed('hidden', true);
    }
    
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

    var x = this.x = d3.time.scale()
        .range([1, chart_width]);
    
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
        .tickSize(-chart_width, 0, 0).ticks(5)
        .tickFormat(formatTicks);
    
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
    
    xLine = this.chart_group.append('line')
        .attr('class', 'xLine hidden')
        .attr('y1', 25)
        .attr('y2', chart_height);;
        //.attr('transform', 'translate(' + margin.left + ',0)');

    function formatTicks(d) {
        if (d === 0) return '0';
        if (d < 1) return d3.format('.2f')(d);
        
        var i = 0;
        var letters = ['', 'K', 'M', 'B'];
        var format;

        while (d >= 1000) {
            d /= 1000;
            i++;
        }

        if (d < 10) format = '.1f';
        else format = '.0f';

        return d3.format(format)(d) + letters[i];
    }
    
    this.chart_group.append('text')
        .attr('id', 'xDate')
        .attr('font-size', '.9em')
        .attr('transform', 'translate(' + (chart_width - 6) + ', 20)')
        .attr('text-anchor', 'end');
}

/*
 * Update the chart. 
 * The x and y axis are updated based on current data. Lines are added/removed
 */
Chart.prototype.update_chart = function() {
    var chart_height = this.height - margin.top  - margin.bottom;
    var chart_width  = this.width  - margin.left - margin.right;
    var line = this.line;
    
    this.x.domain(model.date_range(this.attribute));
    this.y.domain(model.value_range(this.attribute))
        .range([chart_height, 25]).nice();
    
    var companies = this.line_group.selectAll('g.company')
        .data(model.data[this.attribute], function(d) {
            return d.company;
        });
    
    // Enter the data. Applies to newly added lines.
    var enter = companies.enter()
        .append('g').attr('class', 'company');
    
    // Append a line on the chart for the new data
    enter.append('path').attr('class', 'line')
        .attr('id', function(d) { return d.company; })
        .attr('d', function(d) { if (d['values']) return line(d.values); })
        .attr('stroke', function(d) { return d.color; })
        .attr('stroke-opacity', 0);
    
    // Append a new ticker for the new companies to the chart
    var yValue_group = enter.append('g').attr('class', 'yValue_group')
        .attr('id', function(d) { return d.company; })
        .attr('fill', function(d) { return d.color; })
        .attr('font-size', '.9em');
    
    yValue_group.append('text')
        .text(function(d) { return d.company; });
    yValue_group.append('text')
        .attr('class', 'yValue')
        .attr('transform', 'translate(0, 12)')
        .attr('fill', 'black');
    
    // Applied to all lines.
    companies.selectAll('path')
        .transition().duration(500)
        .attr('d', function(d) { if (d['values']) return line(d.values); })
        .attr('stroke-opacity', 1);
    companies.selectAll('.yValue_group')
        .transition().duration(500)
        .attr('transform', function(d) {
            var i = model.company_index(d.company);
            return 'translate(' + (i * chart_width / 10) + ',13)';
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

/*
 * Sets the height of the Chart prototype variable. Since all charts
 * have the same height, they all use the same shared variable.
*/
Chart.prototype.set_height = function() {
    var total_height = $('div#visualizations div#charts').height();
    Chart.prototype.height = ((total_height / 3) > this.min_chart_height)
            ? (total_height / 3) - 7
            : this.min_chart_height;
};
