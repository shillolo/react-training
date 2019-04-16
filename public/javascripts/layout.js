var lmodal = document.getElementById('loginpop');

var rmodal = document.getElementById('registerpop');
  
// Get the button that opens the modal
var rbtn = document.getElementById("register");

var lbtn = document.getElementById("login");

// Get the <span> element that closes the modal
var rspan = document.getElementsByClassName("close")[1];

var lspan = document.getElementsByClassName("close")[0];

var mobileClose = document.getElementById("mobile-close")

var mobilePop = document.getElementById("mobile-popup");

var mobileKonto = document.getElementById("mobile-konto");

if (mobileClose){
    mobileClose.onclick = function() {
        mobilePop.style.display = "none"
    }
}

if (mobileKonto){
    mobileKonto.onclick = function() {
        mobilePop.style.display = "block"
    }
}

function hideDiv(){
    if ($(window).width() > 920) {
        if (mobilePop) {
            mobilePop.style.display = "none"
        }
    }
}

//run on document load and on window resize
$(document).ready(function () {
    //on load
    hideDiv();

    //on resize
    $(window).resize(function(){
        hideDiv();
    });
});

// When the user clicks the button, open the modal 
rbtn.onclick = function() {
    rmodal.style.display = "flex";
}

lbtn.onclick = function() {
    lmodal.style.display = "flex";
}

// When the user clicks on <span> (x), close the modal
rspan.onclick = function() {
    rmodal.style.display = "none";
}

lspan.onclick = function() {
    lmodal.style.display = "none";
}

