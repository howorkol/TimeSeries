var chart_count = 0;
var disable_slides = true;
var company_list = [];
var attribute_list = [];
var data = {
    // attribute: {
    //     company: data_series
    // }
}

$('#accordion_cont').liteAccordion({
    containerWidth: $(window).width() - 23,
    containerHeight: $(window).height() - 13,
    slideSpeed: 1000,
    theme : 'light'
});

$('form#searchBox').submit(function () {
    $('#searchBox > input#button').click();
    return false;
});

$('#searchBox > input#button').click(function () {
    var search_term = $('#searchBox > input#text').val();
    if (search_term === '') { return false; }
    //chart_count = 0;
    
    get_data(search_term, 'add_company', function () {
        disable_slides = false;
    
        $('.company_name').text(search_term);
        $('ol li:nth-child(2) span').click();

        $('#searchBox > input#text').val('');
    });
});

$('span.slide_title').click(function (e) {
    if (disable_slides === true) { return false; }
});

$('div#compare_cont > div').click(function () {
    if (!$(this).hasClass('selected')) {
        $('div#compare_cont > div').toggleClass('selected');
    }
});

$('input#add').click(function() {
    chart_count += 1;
    chart_height = update_chart_height(chart_count);
    add_attribute('new' + chart_count, chart_height, function() {
        
    });
});

function get_data(search_term, option, callback) {
    var chart_height = 0;
    
    if (option === 'add_company') {
        company_list.push(search_term);
        
        if (chart_count === 0) {
            var new_attr = 'open';
            attribute_list.push(new_attr);
            
            // Get data from Quandl.
            chart_count += 1;
            chart_height = update_chart_height(chart_count);
            add_attribute(new_attr, chart_height, callback);
        } else {
            // Get data from Quandl.
            add_company('Google', callback);
        }
    } else if (option === 'add_attribute') {
        attribute_list.push(search_term);
        
        // Get data from Quandl.
        chart_count += 1;
        chart_height = update_chart_height(chart_count);
        add_attribute(chart_height, callback);
    }
}




function add_company(company, callback) {
    // Go through each chart and add this company to it.
    console.log(chart_count);

    callback();
}

function add_attribute(attribute, chart_height, callback) {
    // Create a new chart and add each company to it.
    var rect = d3.select('div#visualizations svg')
        .append('rect')
        .attr('class', 'chart')
        .attr('id', attribute)
        .attr('position', chart_count - 1)
        .attr('width', $('div#visualizations').width())
        .attr('height', chart_height)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('y', chart_height * (chart_count - 1))
        .attr('fill', function() {
            return 'rgb(0,0,' + ((chart_count - 1) * 10) + ')';
        });

    callback();
}

function update_chart_height(chart_count) {
    var total_height = $('div#visualizations').height();
    
    // Calculate the new chart height.
    chart_height = ((total_height / chart_count) > 200)
            ? total_height / chart_count
            : 200;
    
    // Go through all existing charts and make them the new height.
    // The y position needs to be updated as well.
    d3.selectAll('rect.chart')
        .attr('height', chart_height)
        .attr('y', function() {
            return $(this).attr('position') * chart_height;
        });
    
    // Resize the svg element to fit everything.
    d3.select('svg')
        .attr('height', chart_height * chart_count);
    
    return chart_height;
}
    

