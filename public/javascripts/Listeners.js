
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
    }
});

$('form').submit(function() {
    $(this).children().last().click();
    return false;
});

$('form#searchBox > input.button').click(function () {
    var search_term = $('form#searchBox > input.text').val();
    if (search_term === '') { 
        // Output "must enter search term"
        return false; 
    }
    
    // Reset the model.
    model = new Model();
    $('div#visualizations ul li').remove();
    $('p.company').remove();
    $('div#visualizations ul').sortable('option', 'disabled', true);
    
    get_tickers(search_term, function(err, company_info) {
        if (err) {
            console.log('No results found.');
            return false;
        }
        add_company(company_info, function(err) {
            if (err) {
                console.log('No data for ' + company_info.name);
                return false;
            }
            disable_slides = false;
            $('.company_name').text(company_info.name);
            $('ol li:nth-child(2) span').click();
            $('form#searchBox > input.text').val('');
        });
        
    });
});

var YAHOO = {'Finance': {'SymbolSuggest': {}}};
var get_tickers = function(query, callback) {
    YAHOO.Finance.SymbolSuggest.ssCallback = function(data) {
        if (data.ResultSet.Result.length > 0) 
            callback(null, {name:   data.ResultSet.Result[0].name, 
                            ticker: data.ResultSet.Result[0].symbol});
        else
            callback('err', null);
    }

    $.ajax({
        url: "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=" + query,
        dataType: 'jsonp',
        jsonpCallback: 'YAHOO.Finance.SymbolSuggest.ssCallback'
    });
}

$('span.slide_title').click(function() {
    if (disable_slides === true) { return false; }
});

$('div#compare_cont > div').click(function () {
    if (!$(this).hasClass('selected')) {
        $('div#compare_cont > div').toggleClass('selected');
    }
});


$('input#add').click(function() {
    add_attribute(total.toString(), function(err) {});
});

$('div.secondary_div input.button').click(function() {
    var search_term = $('div.secondary_div input.text').val();
    get_tickers(search_term, function(err, company_info) {
        if (err) {
            console.log('No results found.');
            return false;
        }
        add_company(company_info, function(err) {
            if (err) {
                console.log('No data for ' + company_info.name);
                return false;
            }
            $('div.secondary_div input.text').val('');
        });
    });
});