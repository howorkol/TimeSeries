
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
    
    add_company(search_term, function(err) {
        if (err) {
            
        } else {
            disable_slides = false;
            $('.company_name').text(search_term);
            $('ol li:nth-child(2) span').click();
            $('form#searchBox > input.text').val('');
        }
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
    add_attribute(total.toString(), function(err) {});
});

$('div.secondary_div input.button').click(function() {
    var c = $('div.secondary_div input.text').val();
    add_company(c, function(err) {
        if (err) {
            
        } 
        
        $('div.secondary_div input.text').val('');
    });
});