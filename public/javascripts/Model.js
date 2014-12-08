/*
    Model contains all data pertaining to the charts.
*/

/*
    constructor.
    Returns an initialized Model object.
    All fields are empty, unused color list is full.
*/
var Model = function() {
    this.company_list = [];
    this.attribute_list = [];
    this.charts = {};
    this.unused_color_list = [
        '#c9c9c9', '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'
    ];
    this.used_colors = {};
    $('div#slider svg').remove();
    
    this.data = {};
    
    this.add_attribute('dividendvalue');
    this.add_attribute('percentchange');
    
}

/*
    get_num_attributes
    Returns the number of attributes that we have data for.
*/
Model.prototype.get_num_attributes = function() {
    return this.attribute_list.length;
}

/*
    get_num_companies
    Returns the number of companies that we have data for.
*/
Model.prototype.get_num_companies = function() {
    return this.company_list.length;
}

/*
    company_present
    Returns true if we have data for 'company', false otherwise.
*/
Model.prototype.company_present = function(company) {
    return (this.company_index(company) > -1);
}

/*
    company_index
    Returns the index of 'company' in the company list.
    This index corresponds to the order in which the data arrived.
*/
Model.prototype.company_index = function(company) {
    return this.company_list.indexOf(company);
}

/*
    get_company_by_index
    Returns the name of the company given the index.
*/
Model.prototype.get_company_by_index = function(index) {
    return this.company_list[index];
}

/*
    add_chart
    Creates a new Chart and adds it to the charts object.
    The new chart is fully created, displaying lines for data corresponding
    to the attribute_name from this.data.
*/
Model.prototype.add_chart = function(attribute_name, chart) {
    this.charts[attribute_name] = new Chart(attribute_name)
}

/*
    add_attribute
    Creates a new entry in attribute_list for attribute_name.
    Also reserves/fills the data for attribute_name given new_data.
    New_data may not be present but only if this is the first attribute added.
    All charts are updated to reflect the new attribute.
*/
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
    
    this.add_chart(attribute_name);
}

/*
    delete_attribute
    Removes attribute_name from this.data and this.attribute_list.
*/
Model.prototype.delete_attribute = function(attribute_name) {
    var i = this.attribute_list.indexOf(attribute_name);
    this.attribute_list.splice(i, 1);
    
    // Delete the data for that attribute, as well as the chart.
    delete this.charts[attribute_name];
    delete this.data[attribute_name]
    
    this.update_chart_heights();
    this.update_charts();
}

/*
    add_company
    Add a company to the data set and assign it a color.
    All charts are updated to reflect the new company.
*/
Model.prototype.add_company = function(company_name, new_data, all_companies) {
    // Add the new company to the company_list and assign it a color.
    this.company_list.push(company_name);
    this.used_colors[company_name] = this.unused_color_list.shift();
    
    this.data[this.attribute_list[0]][this.company_list.length - 1] = {
        'company': company_name,
        'color'  : this.get_color(company_name),
        'values' : new_data.map(function(d) {
            return { 'date': parseDate(d['year'] + '-01-01'), 'value': d['dividendvalue'] };
        })
    }
    
    this.data[this.attribute_list[1]][this.company_list.length - 1] = {
        'company': company_name,
        'color'  : this.get_color(company_name),
        'values' : new_data.map(function(d) {
            return { 'date': parseDate(d['year'] + '-01-01'), 'value': d['percentchange'] };
        })
    }
    
    if (all_companies) {
        this.all_companies = all_companies;
        update_company_table(this.all_companies);
    }
    
    this.update_charts();
}

/*
    delete_company
    Removes all data for company_name. The color from this company is
    recycled. Update all charts to reflect the changes.
*/
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

/*
    get_color
    Given a company name, return that company's color.
*/
Model.prototype.get_color = function(company_name) {
    return this.used_colors[company_name];
}

/*
    update_charts
    Go through all charts and call update_chart on each.
*/
Model.prototype.update_charts = function() {
    for (var chart in this.charts)
        this.charts[chart].update_chart();
}

/*
    update_chart_heights
    Recalculates the new chart height.
    Go through all charts and call update_chart_height on each.
*/
Model.prototype.update_chart_heights = function() {
    Chart.prototype.set_height();
    for (chart in this.charts) {
        this.charts[chart].update_chart_height();
    }
}

/*
    slider_event
    Go through all charts and call quick_update on each.
*/
Model.prototype.slider_event = function() {
    for (chart in this.charts) {
        this.charts[chart].quick_update();
    }
}

/* 
    chart_hover
    Go through all charts and call set_hover_values on each.
*/
Model.prototype.chart_hover = function(x0) {
    for (chart in this.charts) {
        this.charts[chart].set_hover_values(x0);
    }
}

/*
    date_range
    Returns an array corresponding to [min, max] in terms of dates we have
    data for. min is the farthest date in the past, max the most recent date.
*/
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

/*
    value_range
    Given an attribute, returns the [min, max] of the data we have for that
    attribute.
*/
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

Model.prototype.getClosestValues = function(attribute, date) {
    if (date === undefined) return null;
    var data = { values: {} };
    
    for (var i = 0; i < this.data[attribute].length; i++) {
        var d = this.data[attribute][i];
        for (var j = 0; j < d.values.length; j++) {
            if (d.values[j]['date'] >= date) {
                // Found the first date larger than what we are hovering.
                if ((j === 0) || (Math.abs(date - d.values[j]['date']) <= 
                                      Math.abs(date - d.values[j - 1]['date']))) {
                    data['values'][d['company']] = d.values[j]['value'];
                    if (data['closest_date'] === undefined)
                        data['closest_date'] = d.values[j]['date'];
                    
                } else {
                    data['values'][d['company']] = d.values[j - 1]['value'];
                    if (data['closest_date'] === undefined)
                        data['closest_date'] = d.values[j - 1]['date'];
                }
                
                break;
            }
        }
    }
    
    return data;
}

/*
    getYatX
    Given an attribute, company, and data, returns to value of the company
    for that attribute at the closest point to date.
*//*
Model.prototype.getYatX = function(attribute, company, date) {
    var data;
    
    for (var i = 0; i < this.data[attribute].length; i++) {
        if (this.data[attribute][i].company === company)
            data = this.data[attribute][i].values;
    }
    
    for (var i = 0; i < data.length; i++) {
        if (date >= data[i]['date']) {
            return (Math.abs(date - data[i]['date']) <= 
                    Math.abs(date - data[i - 1]['date'])) 
                ? data[i]['value'] 
                : data[i - 1]['value'];
        }
    }
}*/

