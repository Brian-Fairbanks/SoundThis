var collapsingNav = $("#collapsing-nav");



function fixCantScroll(){
    // Check if body height is higher than window height 
    if ($("body").height() <= $(window).height()) {
        collapsingNav.removeClass("is-overlay");
    }
    else{
        scrollFunction();
    }
}

function scrollFunction() {
    console.log(document.body.scrollTop + "  |  "+document.documentElement.scrollTop);

    if (document.documentElement.scrollTop > 1) {
        collapsingNav.removeClass("is-overlay", 500);
    } else {
        collapsingNav.addClass("is-overlay", 500);
    }
}

// if the page will not allow scrolling, then do not show the full screen header
$(document).ready(fixCantScroll);
window.addEventListener('resize', fixCantScroll);
// When the user scrolls at all, resize the header from the fullscreen
window.onscroll = function() {scrollFunction()};