var Chart = function(attribute) {
    this.attribute = attribute;
    this.plotted_companies = [];
    this.set_height();
    this.make_chart();
};

var chart_container = 'div#visualizations div#charts ul';
var margin = {top: 7, right: 0, bottom: 20, left: 65, s_bottom: 20};

Chart.prototype.min_chart_height = 150;
Chart.prototype.x = d3.time.scale();
Chart.prototype.width;
Chart.prototype.height;
Chart.prototype.transition_dur = 500;

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
    var getYatX = this.getYatX;
    var attribute = this.attribute;
    var x;
    
    // Create the svg element to hold everything.
    var svg = this.svg = d3.select(chart_container)
        .append('li')
        .attr('id', this.attribute)
        .append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height', this.height);/*
        .on('mousemove', function() {
            var x_coor = d3.mouse(this)[0] - margin.left - 1;
            if (x_coor < 0) {
                svg.select('line').style('opacity', 0);
                return null;
            }
            svg.select('line').style('opacity', 1);
            
            var x0 = x.invert(x_coor);
            svg.select('line').attr('transform', 
                    'translate(' + (margin.left + x(x0)) + ',' + margin.top + ')');
            for (var i in model.get_company_list()) {
                var data = model.get_data(attribute, model.get_company_name(i));
                var y0 = getYatX(data, x0);
                console.log(model.get_company_name(i), y0);
            }
        })
        .on('mouseleave', function() {
            svg.select('line').style('opacity', 0);
        });
    
    this.svg.append('line')
        .attr('class', 'xLine')
        .style('opacity', 0)
        .attr('y1', 0)
        .attr('y2', chart_height)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');*/
    
    // The clip path area is where is chart is allowed to show through.
    // When the user selects an area with the slider, the line widths are
    // extended outside the bounds of the chart. The clip path ensures
    // those parts of the lines can't be seen.
    this.svg.append("defs").append("clipPath")
        .attr("id", 'clip_' + this.attribute)
        .append("rect")
        .attr("width", chart_width)
        .attr("height", chart_height);
    
    // Group everything in the chart for easy access. 
    this.chart_group = this.svg.append('g')
        .attr('class', 'chart')
        .attr('id', this.attribute)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = this.x.domain(model.date_range()).range([1, chart_width]);
    
    // Grab and set the y domain and range. The domain depends on the 
    // data for this attribute, range depends on chart height.
    var y = this.y = d3.scale.linear()
        .domain(model.value_range(this.attribute))
        .range([chart_height, 0]).nice();
    
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
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.attribute);

    // Create and append a line group. Used for easy access to
    // the lines of this attribute. Clip path is set.
    this.line_group = this.chart_group.append('g')
        .attr('class', 'line_group')
        .attr('clip-path', 'url(#clip_' + this.attribute + ')');
    
    this.update_chart();
}

Chart.prototype.update_chart = function() {
    var chart_height = this.height - margin.top  - margin.bottom;
    var chart_width  = this.width  - margin.left - margin.right;
    var line = this.line;

    // Set the chart domain and range as it may have changed. 
    this.x.domain(brush.empty() 
            ? model.date_range() 
            : brush.extent());
    this.y.domain(model.value_range(this.attribute))
        .range([chart_height, 0]).nice();
    
    var companies = this.line_group.selectAll('g.company')
        .data(model.data[this.attribute], function(d) {
            return d.company;
        });
    // Enter the data. Applies to newly added lines.
    var enter = companies.enter()
        .append('g').attr('class', 'company')
        .append('path').attr('class', 'line')
        .attr('id', function(d) { return d.company; })
        .attr('d', function(d) { return line(d.values); })
        .attr('stroke', function(d) { return d.color; })
        .attr('stroke-opacity', 0);
    // Applied to all lines.
    companies.selectAll('path')
        .transition().duration(500)
        .attr('d', function(d) { return line(d.values); })
        .attr('stroke-opacity', 1);
    // Remove lines that no longer have data.
    companies.exit().remove();
    
    // Update the axes.
    this.xAxis.tickSize(-(this.height - margin.top - margin.bottom), 0, 0);
    this.chart_group.select(".x.axis")
        .transition().duration(500)
        .attr('transform', 'translate(0,' + (this.height - margin.top - margin.bottom) + ')')
        .call(this.xAxis);
    this.chart_group.select('.y.axis')
        .transition().duration(this.transition_dur)
        .call(this.yAxis);
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
    var y = this.y.range([this.height - margin.top - margin.bottom, 0]).nice();
    var x = this.x;
    var line = this.line;
    
    // Update the svg height.
    this.svg.transition().duration(this.transition_dur)
        .attr('height', this.height);
    // Update the clip path height.
    this.svg.select('defs rect')
        .transition().duration(this.transition_dur)
        .attr('height', this.height);
    // Update xLine
    this.svg.select('line.xLine')
        .transition().duration(this.transition_dur)
        .attr('y2', this.height);
};

/*
    Sets the height of the Chart prototype variable. Since all charts
    have the same height, they all use the same shared variable.
*/
Chart.prototype.set_height = function() {
    var total_height = $('div#visualizations div#charts').height();
    Chart.prototype.height = ((total_height / model.get_num_attributes()) > this.min_chart_height)
            ? (total_height / model.get_num_attributes()) - 7
            : this.min_chart_height;
};

Chart.prototype.getYatX = function(data, date) {
    for (var i in data) {
        i = parseInt(i);
        if (date >= data[i][0]) {
            return (Math.abs(date - data[i][0]) <= 
                    Math.abs(date - data[i - 1][0])) 
                    ? data[i][1] 
                    : data[i - 1][1];
        }
    }
}