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
        $('#viz_slide').click();

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

function get_data(search_term, option, callback) {
    var chart_height = 0;
    
    if (option === 'add_company') {
        company_list.push(search_term);
        
        if (chart_count === 0) {
            attribute_list.push('initial attr');
            
            // Get data from Quandl.
            chart_count += 1;
            chart_height = update_chart_height(chart_count);
            add_attribute(chart_height, callback);
        } else {
            // Get data from Quandl.
            add_company(callback);
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

    callback();
}

function add_attribute(attribute, chart_height, callback) {
    // Create a new chart and add each company to it.

    callback();
}







function update_chart_height(chart_count) {
    var chart_height = $('#viz div.viz_cont').height();
    
    chart_height = ((chart_height / chart_count) > 200)
            ? chart_height
            : 200;
    // Go through all existing charts and make them the new height.
    
    return chart_height;
}
    

