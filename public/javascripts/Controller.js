var chart_height;

var parseDate = d3.time.format("%Y-%m-%d").parse;
var total = 0;
var selected_company = null;
var deselected_color = 'rgba(222, 222, 222, 0.61)';

function add_industry(industry, callback) {
    d3.json('/industry/' + industry, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        model.add_company('average', data.average, data.companies);
        
        callback(null);
    });
}

function add_company(company, callback) {
    company = company.toUpperCase();
    
    if (model.company_present(company)) {
        callback('err');
        return;
    }
    
    d3.json('/query/' + company, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        
        var p = d3.select('div#visulaization_slide div.secondary_div').append('p')
            .attr('class', 'company');
        
        // Add the data to the model.
        model.add_company(company, data);
        
        // Add the company title to the legend.
        p.attr('title', company)
            .style('color', function() {
                if (selected_company == null)
                    return model.get_color(company);
                else return deselected_color;
            })
            .text(company)
            .on('click', function() {
                click_company_name(company);
            });
        
        if (model.get_num_companies() > 1) {
            // If it's not the first company include an 'X'
            p.append('i')
                .attr('id', company)
                .attr('class', 'fa fa-times')
                .on('click', function() {
                    var comp = $(this).attr('id');
                    setTimeout(clear_selected_company, 100);
                    delete_company(comp, function() {
                        $('p.company i#' + comp).parent().remove();
                    });
                });
        }
        
        callback(null);
    });
    
    function set_selected_company(c) {
        var ps = d3.selectAll('p.company');
        ps.each(function() {
            var name = d3.select(this).text();
            if (name != c) {
                d3.select(this).style('color', deselected_color);
                d3.selectAll('g#' + name).attr('fill', deselected_color);
                d3.selectAll('path#' + name)
                    .attr('stroke', deselected_color);
            }
        });
        selected_company = c;
    }
    
    function clear_selected_company() {
        var ps = d3.selectAll('p.company');
        ps.each(function() {
            var name = d3.select(this).text();
            d3.select(this).style('color', model.get_color(name));
            d3.selectAll('g#' + name).attr('fill', model.get_color(name));
            d3.selectAll('path#' + name)
                .attr('stroke', model.get_color(name))
                .moveToFront();
        });
        selected_company = null;
    }
    
    function click_company_name(c) {
        if (model.get_num_companies() == 1) return;
        var ps = d3.selectAll('p.company');
        
        if (selected_company == null)
            set_selected_company(c);
        else if (selected_company == c)
            clear_selected_company();
        else {
            clear_selected_company();
            set_selected_company(c);
        }
    }
}

function delete_company(company_name, callback) {
    model.delete_company(company_name);
    callback();
}

d3.selection.prototype.moveToFront = function() {
    // Info found here 
    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};