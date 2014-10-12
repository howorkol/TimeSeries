var Chart = function(attribute) {
    this.attribute = attribute;
    this.plotted_companies = [];
    this.set_height();
    this.make_chart();
};

Chart.prototype.chart_container = 'div#visualizations ul';
Chart.prototype.min_chart_height = 150;
Chart.prototype.margin = {top: 5, right: 12, bottom: 5, left: 65};
Chart.prototype.width = $(Chart.prototype.chart_container).width() 
        - Chart.prototype.margin.left - Chart.prototype.margin.right;
Chart.prototype.x = d3.time.scale();
Chart.prototype.y = d3.scale.linear();
Chart.prototype.line = d3.svg.line()
        .defined(function(d) { return d[1] != null; })
        .x(function(d) { return Chart.prototype.x(d[0]); })
        .y(function(d) { return Chart.prototype.y(d[1]); });
Chart.prototype.height;
Chart.prototype.transition_dur = 500;

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

    var x = this.x.domain(model.date_range()).range([0, chart_width]);
    var y = this.y.domain(model.value_range(this.attribute)).range([chart_height, 0]);
    
    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom');
    this.yAxis = d3.svg.axis().scale(this.y).orient('left');

    for (index in model.get_company_list()) {
        this.chart_group.append("path")
            .datum(model.get_data(this.attribute, model.get_company_name(index)))
            .attr("class", "line")
            .attr('id', model.get_company_name(index))
            .attr("d", Chart.prototype.line)
            .attr('stroke', model.get_color(model.get_company_name(index)));
        this.plotted_companies.push(model.get_company_name(index));
    }
    
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

    this.svg
        .transition().duration(this.transition_dur)
        .attr('height', this.height);
    this.chart_group.select('.y')
        .transition().duration(this.transition_dur)
        .call(this.yAxis);
    this.chart_group.selectAll('.line')
        .transition().duration(this.transition_dur)
        .attr('d', Chart.prototype.line);
};

Chart.prototype.update_chart_lines = function() {
    var x = this.x.domain(model.date_range());
    var y = this.y.domain(model.value_range(this.attribute));
    
    this.chart_group.select('.y')
        .transition().duration(this.transition_dur)
        .call(this.yAxis);
    this.chart_group.selectAll('.line')
        .transition().duration(this.transition_dur)
        .attr('d', Chart.prototype.line);

    var companies = [];
    $.each(model.get_company_list(), function(i, el) {
        companies.push(el);
    });
    $.each(this.plotted_companies, function(i, el) {
        if ($.inArray(el, companies) === -1) companies.push(el);
    });
    
    var plotted_companies = this.plotted_companies;
    var chart_group = this.chart_group;
    var attribute = this.attribute;
    var transition_dur = this.transition_dur;
    
    $.each(companies, function(i, el) {
        if ($.inArray(el, plotted_companies) === -1) {
            chart_group.append("path")
                .datum(model.get_data(attribute, el))
                .attr("class", "line")
                .attr('id', el)
                .attr("d", Chart.prototype.line)
                .attr('stroke', model.get_color(el))
                .attr('stroke-opacity', 0)
                .transition()
                .duration(transition_dur)
                .attr('stroke-opacity', 1);
            plotted_companies.push(el);
        }
        else if ($.inArray(el, model.get_company_list()) === -1) {
            chart_group.select('path#' + el)
                .transition()
                .duration(transition_dur)
                .attr('stroke-opacity', 0)
                .remove();
            var i = plotted_companies.indexOf(el);
            plotted_companies.splice(i, 1);
        }
    });
    
};

Chart.prototype.set_height = function() {
    var total_height = $('div#visualizations').height();
    
    // Calculate the new chart height.
    Chart.prototype.height = ((total_height / model.get_num_attributes()) > this.min_chart_height)
            ? total_height / model.get_num_attributes()
            : this.min_chart_height;
};