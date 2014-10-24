var timeout;

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
            delete_attribute(ui.item, ui.item.attr('id'), function(err) {
                if (err) {
                    
                } else {
                    if (model.get_num_attributes() == 1) {
                        $('div#visualizations ul').sortable('option', 'disabled', true);
                    }
                }
            });
        }
    
        $('i#trash').addClass('hidden');
        $('i#trash').removeClass('fa-trash-o');
        $('i#trash').addClass('fa-trash');
        
        update_slider($('ul li:first-child').attr('id'));
    }
});

$('form').submit(function() {
    $(this).children().last().click();
    return false;
});

$('form#searchBox > input.button').click(function () {
    var selected_company = {
        'ticker': $('form#searchBox .select option:selected').attr('ticker'),
        'name': $('form#searchBox .select option:selected').attr('name')
    }
    
    model = new Model();
    $('div#visualizations ul li').remove();
    $('p.company').remove();
    $('div#visualizations ul').sortable('option', 'disabled', true);
    
    add_company(selected_company, function(err) {
        if (err) {
            console.log('No data for ' + selected_company.name);
            return false;
        }
        
        disable_slides = false;
        $('.company_name').text(selected_company.name);
        $('ol li:nth-child(2) span').click();
        $('form#searchBox > input.text').val('');
        $('form#searchBox select option').remove();
        
    });
});

$('span.slide_title').click(function() {
    if (disable_slides === true) { return false; }
});

$('div#compare_cont > div').click(function () {
    if (!$(this).hasClass('selected')) {
        $('div#compare_cont > div').toggleClass('selected');
    }
});


$('input#add').click(function() {
    add_attribute(total.toString(), function(err) {
        var full_height = $('div#charts ul').height() - $('div#charts').height();
        $('div#charts').animate({scrollTop: full_height}, 'slow');
    });
});

$('div.secondary_div input.button').click(function() {
    var search_term = $('div.secondary_div input.text').val();
    
    get_tickers(search_term, function(err, company_info) {
        if (err) {
            console.log('No results found.');
            return false;
        }
        add_company(company_info[0], function(err) {
            if (err) {
                console.log('No data for ' + company_info[0].name);
                return false;
            }
            $('div.secondary_div input.text').val('');
        });
    });
});

var YAHOO = {'Finance': {'SymbolSuggest': {}}};
var get_tickers = function(query, callback) {
    YAHOO.Finance.SymbolSuggest.ssCallback = function(data) {
        if (data.ResultSet.Result.length > 0) 
            callback(null, data.ResultSet.Result.map(function(item) {
                return {'ticker': item.symbol, 'name': item.name};
            }));
        else
            callback('err', null);
    }

    $.ajax({
        url: "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=" + query,
        dataType: 'jsonp',
        jsonpCallback: 'YAHOO.Finance.SymbolSuggest.ssCallback'
    });
}

$('form#searchBox .text').on('input propertychange paste', function() {
    var search_term = $(this).val();
    if (search_term === '') { 
        // Output "must enter search term"
        $('form#searchBox input.button').attr('disabled','disabled');
        $('form#searchBox select option').remove();
        return false; 
    }
    
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        get_tickers(search_term, function(err, companies) {
            $('form#searchBox input.button').removeAttr('disabled');
            $('form#searchBox select option').remove();
            var elem = $('form#searchBox .select');
            for(company in companies) {
                elem.append($("<option></option>")
                    .attr('ticker', companies[company].ticker)
                    .attr('name', companies[company].name)
                    .text(companies[company].ticker + ' - ' + companies[company].name));
            }
            $('form#searchBox .text').val(companies[0].ticker + ' - ' + companies[0].name);
        })
    }, 1000);
});

$('form#searchBox .select').change(function() {
    var val = $('form#searchBox .select option:selected').text();
    $('form#searchBox .text').val(val);
});