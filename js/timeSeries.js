
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
    var text = $('#searchBox > input#text').val();
    if (text === '') return false;
    
    disable_slides = false;
    
    $('#comp_name').text(text);
    $('#viz_slide').click();
    
    $('#searchBox > input#text').val('');
});

$('span.slide_title').click(function(e) {
    if (disable_slides === true)
        return false;
});
