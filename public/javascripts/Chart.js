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
    
    // Create the svg element to hold everything.
    this.svg = d3.select(chart_container)
        .append('li')
        .attr('id', this.attribute)
        .append('svg')
        .attr('width',  $(chart_container).width())
        .attr('height', this.height)
        .on('mousemove', function() {
            //var x0 = x.invert(d3.mouse(this)[0] - margin.left);
            //var bisectDate = d3.bisector(function(d) { return d[0]; }).left;
            //var i = bisectDate(data, x0, 1);    
            //console.log(x0);
        });
    
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

    // Grab and set the x domain. Either set to the full date range
    // or the extent under the brush.
    var x = this.x.domain(brush.empty() 
            ? model.date_range() 
            : brush.extent())
        .range([1, chart_width]);
    // Grab and set the y domain and range. The domain depends on the 
    // data for this attribute, range depends on chart height.
    var y = this.y = d3.scale.linear()
        .domain(model.value_range(this.attribute))
        .range([chart_height, 0]).nice();
    
    // Define the line function used for this attribute.
    var line = this.line = d3.svg.line()
        .defined(function(d) { return d[1] != null; })
        .x(function(d) { return Chart.prototype.x(d[0]); })
        .y(function(d) { return y(d[1]); });
    
    // Set the attributes for the x and y axis.
    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom')
        .tickSize(-chart_height, 0, 0);
    this.yAxis = d3.svg.axis().scale(this.y).orient('left')
        .tickSize(-chart_width, 0, 0).ticks(5);
    
    // Append the x axis.
    this.chart_group.append('g')
        .attr('class', 'x axis')
        .call(this.xAxis)
        .attr('transform', 'translate(0,' + chart_height + ')');
    
    // Append the y axis.
    this.chart_group.append('g')
        .attr('class', 'y axis')
        .call(this.yAxis)
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
    
    // Got through the data for this attribute and add a line
    // for each company.
    for (index in model.get_company_list()) {
        this.line_group.append("path")
            .datum(model.get_data(this.attribute, model.get_company_name(index)))
            .attr("class", "line")
            .attr('id', model.get_company_name(index))
            .attr("d", line)
            .attr('stroke', function() {
                if (selected_company == null || selected_company == model.get_company_name(index))
                    return model.get_color(model.get_company_name(index));
                else 
                    return deselected_color;
            });
            //.attr('stroke', model.get_color(model.get_company_name(index)));
        this.plotted_companies.push(model.get_company_name(index));
    }
    
    // This attribute may contain a large range of dates than previous
    // attributes. Update the slider to reflect this.
    update_slider_domain();
}

/*
    Update the height of all charts. This function is called when a
    chart is added or removed to allow dynamic chart sizes.
*/
Chart.prototype.update_chart_height = function() {
    // Get and set the y range to reflect the new height.
    var y = this.y.range([this.height - margin.top - margin.bottom, 0]);
    // Get the x and line. 
    var x = this.x;
    var line = this.line;
    
    // Update the xAxis tick lines. As the chart is resized, the tick lines
    // need to be lengthened or shortened to maintain the full chart height.
    this.xAxis.tickSize(-(this.height - margin.top - margin.bottom), 0, 0);
    // Call the xAxis to reflect the change in tickSize.
    this.chart_group.select(".x.axis")
        .transition().duration(this.transition_dur)
        .call(this.xAxis);
    // Update the svg height.
    this.svg
        .transition().duration(this.transition_dur)
        .attr('height', this.height);
    // Update the clip path height.
    this.svg.select('defs rect')
        .transition().duration(this.transition_dur)
        .attr('height', this.height);
    // Update the position of the xAxis.
    this.chart_group.select('.x.axis')
        .transition().duration(this.transition_dur)
        .attr('transform', 'translate(0,' + (this.height - margin.top - margin.bottom) + ')');
    // Update the yAxis as the range has changed.
    this.chart_group.select('.y')
        .transition().duration(this.transition_dur)
        .call(this.yAxis);
    // Update all lines to reflect the change in y range.
    this.chart_group.selectAll('.line')
        .transition().duration(this.transition_dur)
        .attr('d', line);
};

/*
    This function updates the lines on the chart. That is,
    adds new lines if new companies are available, and removes
    lines when companies have been removed.
*/
Chart.prototype.update_chart_lines = function() {
    // Get and set the x domain. Useful as the slider may
    // have changed it's extent.
    
    // MAY BE ABLE TO REMOVE
    var x = this.x.domain(
        brush.empty() 
            ? model.date_range() 
            : brush.extent()
    );
    // Sets the y domain for this attribute. Since a company has
    // been added or removed the y domain may have changed.
    var y = this.y.domain(model.value_range(this.attribute)).nice();
    var line = this.line;
    
    // Update the yAxis to reflect the new domain.
    this.chart_group.select('.y')
        .transition().duration(this.transition_dur)
        .call(this.yAxis);
    // Also update the lines to reflect the new y domain.
    this.chart_group.selectAll('.line')
        .transition().duration(this.transition_dur)
        .attr('d', line);

    // Gets a list of all companies either plotted on the 
    // chart, or that there is data for. The point is that if a
    // company is on the chart but no data exists for it, it gets
    // removed. If there is data for a company not on the chart, it
    // gets added.
    var companies = [];
    $.each(model.get_company_list(), function(i, el) {
        companies.push(el);
    });
    $.each(this.plotted_companies, function(i, el) {
        if ($.inArray(el, companies) === -1) companies.push(el);
    });
    
    // Get local copies for these as 'this' has strange contexts.
    var plotted_companies = this.plotted_companies;
    var line_group = this.line_group;
    var attribute = this.attribute;
    var transition_dur = this.transition_dur;
    
    // Go through all the companies in the companies list.
    $.each(companies, function(i, el) {
        // If the company isn't yet plotted on this chart, add it.
        if ($.inArray(el, plotted_companies) === -1) {
            line_group.append("path")
                .datum(model.get_data(attribute, el))
                .attr("class", "line")
                .attr('id', el)
                .attr("d", line)
                .attr('stroke', function() {
                    if (selected_company == null || selected_company == el)
                        return model.get_color(el);
                    else 
                        return deselected_color;
                })
                .attr('stroke-opacity', 0)
                .transition()
                .duration(transition_dur)
                .attr('stroke-opacity', 1);
            plotted_companies.push(el);
        }
        else if ($.inArray(el, model.get_company_list()) === -1) {
            // If there is no data for this company it gets removed.
            line_group.select('path#' + el).remove();
            var i = plotted_companies.indexOf(el);
            plotted_companies.splice(i, 1);
        }
    });
    
    // Since companies have been added or removed, the domain
    // of the slider may have changed.
    update_slider_domain();
    this.update_xAxis();
};

/*
    Called when the slider extent changes. Updates all charts
    domain, as well as changes the xAxis to only show the ticks
    within the domain shown.
*/
Chart.prototype.update_chart_domain = function(len) {
    var line = this.line;
    this.chart_group.selectAll(".line")
        .attr("d", line);
    this.chart_group.select(".x.axis")
        .call(this.xAxis);
}

Chart.prototype.update_xAxis = function() {
    this.chart_group.select(".x.axis")
        .transition()
        .duration(500)
        .call(this.xAxis);
}

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