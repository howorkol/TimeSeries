var Chart = function(attribute) {
    this.attribute = attribute;
    this.set_height();
    this.make_chart();
};

Chart.prototype.chart_container = 'div#visualizations ul';
Chart.prototype.min_chart_height = 150;
Chart.prototype.margin = {top: 5, right: 12, bottom: 5, left: 65};
Chart.prototype.width = $(Chart.prototype.chart_container).width() 
        - Chart.prototype.margin.left - Chart.prototype.margin.right;
Chart.prototype.height;

Chart.prototype.make_chart = function() {
    
    var chart_height = this.height - this.margin.top - this.margin.bottom;
    var chart_width = this.width - this.margin.left - this.margin.right;
    
    this.svg = d3.select(this.chart_container)
        .append('li')
        .attr('id', this.attribute)
        .append('svg')
        .attr('width',  $(this.chart_container).width())
        .attr('height', this.height);
    
    this.chart_group = this.svg.append('g')
        .attr('class', 'chart')
        .attr('id', this.attribute)
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
       
    var x = this.x = d3.time.scale()
        .domain([this.data_min(0), this.data_max(0)])
        .range([0, chart_width]);
    var y = this.y = d3.scale.linear()
        .domain([this.data_min(1), this.data_max(1)])
        .range([chart_height, 0]);
    
    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom');
    this.yAxis = d3.svg.axis().scale(this.y).orient('left');
    
    var line = d3.svg.line()
        .defined(function(d) { return d[1] != null; })
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });
    
    for (c in comp_data[this.attribute]) {
        this.chart_group.append("path")
            .datum(comp_data[this.attribute][c])
            .attr("class", "line")
            .attr("d", line)
            .attr('stroke', used_colors[c]);
    }
    /*
    // X Axis
    this.chart_group.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + chart_height + ')')
        .call(this.xAxis);*/
    
    // Y Axis
    this.chart_group.append('g')
        .attr('class', 'y axis')
        .call(this.yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.attribute);
}

Chart.prototype.update_chart_height = function() {
    var y = this.y.range([this.height - this.margin.top - this.margin.bottom, 0]);
    var x = this.x;
    
    var line = d3.svg.line()
        .defined(function(d) { return d[1] != null; })
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });
    
    this.svg
        .transition().duration(500)
        .attr('height', this.height);
    this.chart_group.select('.y')
        .transition().duration(500)
        .call(this.yAxis);
    this.chart_group.selectAll('.line')
        .transition().duration(500)
        .attr('d', line);
};

Chart.prototype.update_chart_lines = function() {
    
};

Chart.prototype.set_height = function() {
    var total_height = $('div#visualizations').height();
    
    // Calculate the new chart height.
    Chart.prototype.height = ((total_height / attribute_list.length) > min_chart_height)
            ? total_height / attribute_list.length
            : min_chart_height;
};

Chart.prototype.data_min = function(i) {
    var min;
    //for (key in attribute_list) {
        for (company in comp_data[this.attribute]) {
            var local_min = d3.min(comp_data[this.attribute][company], function(d) {
                return d[i];
            });
            
            if ((min == undefined) || (local_min < min)) min = local_min;
        }
    //}
    return min;
}

Chart.prototype.data_max = function(i) {
    var max;
    //for (key in attribute_list) {
        for (company in comp_data[this.attribute]) {
            var local_max = d3.max(comp_data[this.attribute][company], function(d) {
                return d[i];
            });
            
            if ((max == undefined) || (local_max > max)) max = local_max;
        }
    //}
    return max;
}