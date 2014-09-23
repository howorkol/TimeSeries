
var disable_slides = true;

$('#accordion_cont').liteAccordion({
    containerWidth: $(window).width() - 23,
    containerHeight: $(window).height() - 13,
    slideSpeed: 1000,
    theme : 'light'
});

$('form#searchBox').submit(function() {
    $('#searchBox > input#button').click();
    return false; 
});

$('#searchBox > input#button').click(function() {
    var search_term = $('#searchBox > input#text').val();
    if (search_term === '') return false;
    
    get_data(search_term, function() {
        disable_slides = false;
    
        $('.company_name').text(search_term);
        $('#viz_slide').click();

        $('#searchBox > input#text').val('');
    });
});

$('span.slide_title').click(function(e) {
    if (disable_slides === true)
        return false;
});

$('div#compare_cont > div').click(function() {
    if (!$(this).hasClass('selected')) {
        $('div#compare_cont > div').toggleClass('selected');
    }

    
});

function get_data(search_term, callback) {
    callback();
}
    

