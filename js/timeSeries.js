var chart_count = 0;
var disable_slides = true;
var min_chart_height = 150;

var company_list = [];
var attribute_list = [];
var data = {
    // attribute: {
    //     company: data_series
    // }
}

var total = 0;

$('#accordion_cont').liteAccordion({
    containerWidth: $(window).width() - 23,
    containerHeight: $(window).height() - 13,
    slideSpeed: 1000,
    theme : 'light'
});

$('div#visualizations ul').sortable({
    'disabled': true,
    'start': function(e, ui) {
        $('i#trash').removeClass('hidden');
    },
    'sort': function(e) {
        var trash = $('i#trash').offset();
        trash.width = $('i#trash').width();
        trash.height = $('i#trash').height();
        
        if ((e.pageX >= trash.left) 
                && (e.pageX <= (trash.left + trash.width))
                && (e.pageY >= trash.top)
                && (e.pageY <= (trash.top + trash.height))) {
            
            $('i#trash').removeClass('fa-trash');
            $('i#trash').addClass('fa-trash-o');
        } else {
            $('i#trash').removeClass('fa-trash-o');
            $('i#trash').addClass('fa-trash');
        }
    },
    'stop': function(e, ui) {
        var trash = $('i#trash').offset();
        trash.width = $('i#trash').width();
        trash.height = $('i#trash').height();
        
        if ((e.pageX >= trash.left) 
                && (e.pageX <= (trash.left + trash.width))
                && (e.pageY >= trash.top)
                && (e.pageY <= (trash.top + trash.height))) {
            
            // Remove the element
            delete_attribute(ui.item, ui.item.children().attr('id'))
            
            // If there is only one attribute left, disable sorting.
            if (attribute_list.length == 1) {
                $('div#visualizations ul').sortable('option', 'disabled', true);
            }
        }
    
        $('i#trash').addClass('hidden');
        $('i#trash').removeClass('fa-trash-o');
        $('i#trash').addClass('fa-trash');
    }
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
    attribute_list.push('new' + chart_count);
    add_attribute('new' + chart_count, function() {
        
    });
});

function get_data(search_term, option, callback) {
    
    if (option === 'add_company') {
        company_list.push(search_term);
        
        if (chart_count === 0) {
            var new_attr = 'open';
            attribute_list.push(new_attr);
            
            // Get data from Quandl.
            add_attribute(new_attr, callback);
        } else {
            // Get data from Quandl.
            add_company('Google', callback);
        }
    } else if (option === 'add_attribute') {
        attribute_list.push(search_term);
        
        // Get data from Quandl.
        add_attribute(search_term, callback);
    }
}

function add_company(company, callback) {
    // Go through each chart and add this company to it.
    console.log(chart_count);

    callback();
}

function add_attribute(attribute, callback) {
    // Create a new chart and add each company to it.
    chart_count += 1;
    total += 1;
    chart_height = update_chart_height();
    
    var svg = d3.select('div#visualizations ul')
        .append('li')
        .append('svg')
        .attr('class', 'chart')
        .attr('id', attribute)
        .attr('position', chart_count - 1)
        .attr('height', chart_height);
    
    svg.append('rect')
        .attr('width', $('div#visualizations svg').width())
        .attr('height', chart_height)
        .attr('fill', function() {
            return 'rgb(' + ((total- 1) * 10) + ',0,0)';
        });
    
    if (attribute_list.length > 1) {
        $('div#visualizations ul').sortable('option', 'disabled', false);
    }
    
    callback();
}

function delete_attribute(li_element, chart_id) {
    li_element.remove();
    var i = attribute_list.indexOf(chart_id);
    attribute_list.splice(i, 1);
    
    chart_count -= 1;
    total -= 1;
    chart_height = update_chart_height();
}

function update_chart_height() {
    var total_height = $('div#visualizations').height();
    
    // Calculate the new chart height.
    chart_height = ((total_height / chart_count) > min_chart_height)
            ? total_height / chart_count
            : min_chart_height;
    
    // Resize each svg element to fit the resized chart.
    d3.selectAll('svg.chart')
        .attr('height', chart_height);
    
    // Go through all existing charts and make them the new height.
    d3.selectAll('svg.chart rect')
        .attr('height', chart_height);
    
    return chart_height;
}
    

