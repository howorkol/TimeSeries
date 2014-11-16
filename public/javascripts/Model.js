
//var color = d3.scale.category10();

var Model = function() {
    this.company_list = [];
    this.attribute_list = [];
    this.charts = {};
    this.unused_color_list = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'
    ];
    this.used_colors = {};
    $('div#slider svg').remove();
    
    this.data = {};
}

Model.prototype.get_num_attributes = function() {
    return this.attribute_list.length;
}

Model.prototype.get_company_list = function() {
    return this.company_list;
}

Model.prototype.get_attribute_list = function() {
    return this.attribute_list;
}

Model.prototype.get_company_name = function(index) {
    return this.company_list[index];
}
/*
Model.prototype.get_data = function(attribute_name, company_name) {
    if (company_name)
        return this.attribute_data[attribute_name][company_name];
    else
        return this.attribute_data[attribute_name];
}*/

Model.prototype.get_data = function(attribute_name, company_name) {
    for (var i = 0; i < this.data[attribute_name].length; i++) {
        if (this.data[attribute_name][i].company === company_name)
            return this.data[attribute_name][i].values;
    }
}

Model.prototype.add_chart = function(attribute_name, chart) {
    this.charts[attribute_name] = new Chart(attribute_name)
}

Model.prototype.add_attribute = function(attribute_name, new_data) {
    this.attribute_list.push(attribute_name);
    this.data[attribute_name] = [];
    
    if (new_data) {
        for (var i = 0; i < this.company_list.length; i++) {
            this.data[attribute_name][i] = {
                'company': this.company_list[i],
                'color'  : this.get_color(this.company_list[i]),
                'values' : new_data.map(function(d) {
                    return { 'date': parseDate(d[0]), 'value': +d[i + 1] || d[i + 1] };
                })
            }
        }
    }
    
    this.update_chart_heights();
    this.update_charts();
}

Model.prototype.delete_attribute = function(attribute_name) {
    var i = this.attribute_list.indexOf(attribute_name);
    this.attribute_list.splice(i, 1);
    
    // Delete the data for that attribute, as well as the chart.
    delete this.charts[attribute_name];
    delete this.data[attribute_name]
    
    this.update_chart_heights();
    this.update_charts();
}

Model.prototype.add_company = function(company_name, new_data) {
    // Add the new company to the company_list and assign it a color.
    this.company_list.push(company_name);
    this.used_colors[company_name] = this.unused_color_list.shift();
    
    for (var i = 0; i < this.attribute_list.length; i++) {
        this.data[this.attribute_list[i]][this.company_list.length - 1] = {
            'company': company_name,
            'color'  : this.get_color(company_name),
            'values' : new_data.map(function(d) {
                return { 'date': parseDate(d[0]), 'value': +d[i + 1] || d[i + 1] };
            })
        }
    }
    
    this.update_charts();
}

Model.prototype.delete_company = function(company_name) {
    var company_index = this.company_list.indexOf(company_name);
    for (var i = 0; i < this.attribute_list.length; i++) {
        this.data[this.attribute_list[i]].splice(company_index, 1);
    }
    
    // Remove the company from company_list.
    this.unused_color_list.unshift(this.used_colors[company_name]);
    delete this.used_colors[company_name];
    this.company_list.splice(company_index, 1);
    this.update_charts();
}

Model.prototype.get_color = function(company_name) {
    return this.used_colors[company_name];
}

Model.prototype.update_charts = function() {
    for (var chart in this.charts)
        this.charts[chart].update_chart();
}

Model.prototype.update_chart_heights = function() {
    Chart.prototype.set_height();
    for (chart in this.charts) {
        this.charts[chart].update_chart_height();
    }
}

Model.prototype.slider_event = function() {
    for (chart in this.charts) {
        this.charts[chart].quick_update();
    }
}

Model.prototype.date_range = function() {
    // Since the x domain of all charts should be equal, return [min, max]
    // of the dates from all datasets.
    var min, max;
    
    for (var attribute in this.data) {
        for (var i = 0; i < this.data[attribute].length; i++) {
            var local_min = d3.min(this.data[attribute][i]['values'], function(d) {
                if (d['value'] !== null) return d['date'];
            });
            var local_max = d3.max(this.data[attribute][i]['values'], function(d) {
                if (d['value'] !== null) return d['date'];
            });
            if ((min == undefined) || (local_min < min)) min = local_min;
            if ((max == undefined) || (local_max > max)) max = local_max;
        }
    }
    return [min, max];
}

Model.prototype.value_range = function(attribute) {
    // The y domain of all charts doesn't need to be the same. So return
    // the [min, max] of the values of this dataset.
    var min, max;
    
    for (var i = 0; i < this.company_list.length; i++) {
        var curr_company = this.company_list[i];
        var local_min = d3.min(this.data[attribute][i]['values'], function(d) {
            if (d['value'] !== null) return d['value'];
        });
        var local_max = d3.max(this.data[attribute][i]['values'], function(d) {
            if (d['value'] !== null) return d['value'];
        });
        if ((min == undefined) || (local_min < min)) min = local_min;
        if ((max == undefined) || (local_max > max)) max = local_max;
    }
    return [min, max];
}

Model.prototype.getYatX = function(attribute, company, date) {
    var data = this.get_data(attribute, company);
    for (var i = 0; i < data.length; i++) {
        if (date >= data[i]['date']) {
            return (Math.abs(date - data[i]['date']) <= 
                    Math.abs(date - data[i - 1]['date'])) 
                ? data[i]['value'] 
                : data[i - 1]['value'];
        }
    }
}

Model.prototype.chart_hover = function(x0) {
    for (chart in this.charts) {
        this.charts[chart].set_hover_values(x0);
    }
}