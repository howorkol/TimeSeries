var init_attribute = '1';
var disable_slides = true;
var chart_height;
var query_part = 'https://quandl.com/api/v1/multisets.json?collapse=monthly&columns=';
var auth_token = '&auth_token=WczNwgPepRcbZR9Yf7qt';
var parseDate = d3.time.format("%Y-%m-%d").parse;
var total = 0;
var model = new Model();
var selected_company = null;
var deselected_color = 'rgba(222, 222, 222, 0.61)';

function add_company(company_info, callback) {
    
    var p = d3.select('div#visulaization_slide div.secondary_div').append('p')
        .attr('class', 'company');
    
    if (model.get_num_attributes() == 0) {
        // This is the first company being added.
        total = 1;
        
        var query = query_part;
        query += 'WIKI.' + company_info.ticker + '.' + init_attribute + auth_token;
        
        d3.json(query, function(err, data) {
        
            if (err) {
                callback(err);
                p.remove();
                return;
            }
            
            model.add_attribute(init_attribute);
            model.add_company(company_info.ticker, data.data);
            create_slider();
            model.add_chart(init_attribute);
            
            p.attr('title', company_info.name)
                .style('color', model.get_color(company_info.ticker))
                .text(company_info.ticker)
                .on('click', function() {
                    click_company_name(company_info.ticker);
                });
                
            total++;
            
            callback(null);
        });
    } else {
        // This is not the first company being added.
        var query = query_part;
        for (a in model.attribute_list) {
            query += 'WIKI.' + company_info.ticker + '.' + model.attribute_list[a] + ',';
        }
        query = query.substring(0, query.length - 1);
        query += auth_token;
        
        d3.json(query, function(err, data) {
            if (err) {
                callback(err);
                p.remove();
                return;
            }
            
            model.add_company(company_info.ticker, data.data);
            update_slider();
            
            p.attr('title', company_info.name)
                .style('color', function() {
                    if (selected_company == null)
                        return model.get_color(company_info.ticker);
                    else return deselected_color;
                })
                .text(company_info.ticker)
                .on('click', function() {
                    click_company_name(company_info.ticker);
                })
              .append('i')
                .attr('id', company_info.ticker)
                .attr('class', 'fa fa-times')
                .on('click', function() {
                    var comp = $(this).attr('id');
                    delete_company(comp, function() {
                        $('p.company i#' + comp).parent().remove();
                    });
                });
            
            callback(null);
        });
    }
    
    function click_company_name(c) {
        if (model.get_company_list().length == 1) return;
        var ps = d3.selectAll('p.company');
        
        if (selected_company == null) {
            ps.each(function() {
                var name = d3.select(this).text();
                if (name != c) {
                    d3.select(this).style('color', deselected_color);
                    d3.selectAll('path#' + name)
                        .attr('stroke', deselected_color);
                }
            });
            selected_company = c;
        } else if (selected_company == c) {
            ps.each(function() {
                var name = d3.select(this).text();
                d3.select(this).style('color', model.get_color(name));
                d3.selectAll('path#' + name)
                    .attr('stroke', model.get_color(name))
                    .moveToFront();
            });
            selected_company = null;
        } else {
            ps.each(function() {
                var name = d3.select(this).text();
                if (name == c) {
                    d3.select(this).style('color', model.get_color(name));
                    d3.selectAll('path#' + name).attr('stroke', model.get_color(name))
                        .moveToFront();
                } else {
                    d3.select(this).style('color', deselected_color);
                    d3.selectAll('path#' + name).attr('stroke', deselected_color);
                }
            });
            selected_company = c;
        }
    }
}

function delete_company(company_name, callback) {
    model.delete_company(company_name);
    update_slider();
    callback();
}

function add_attribute(attribute_name, callback) {
    // User adds a new attribute.
    var query = query_part;
    for (c in model.company_list) {
        query += 'WIKI.' + model.company_list[c] + '.' + attribute_name + ',';
    }
    query = query.substring(0, query.length - 1);
    query += auth_token;
    
    d3.json(query, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        model.add_attribute(attribute_name, data.data);
        model.add_chart(attribute_name);
        $('div#visualizations ul').sortable('option', 'disabled', false);
        
        total++;
        callback(null);
    });
}

function delete_attribute(li_element, attribute_name, callback) {
    // Remove html node from page.
    li_element.remove();
    model.delete_attribute(attribute_name);
    callback();
}

d3.selection.prototype.moveToFront = function() {
    // Info found here 
    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};