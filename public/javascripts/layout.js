var lmodal = document.getElementById("loginpop");

var rmodal = document.getElementById("registerpop");

// Get the button that opens the modal
var rbtn = document.getElementById("register");

var lbtn = document.getElementById("login");

// Get the <span> element that closes the modal
var rspan = document.getElementsByClassName("close")[1];

var lspan = document.getElementsByClassName("close")[0];

var mobileClose = document.getElementById("mobile-close");

var mobilePop = document.getElementById("mobile-popup");

var mobileKonto = document.getElementById("mobile-konto");

if (mobileClose) {
  mobileClose.onclick = function() {
    mobilePop.style.display = "none";
    $("body").css({ "overflow-y": "auto" });
  };
}

if (mobileKonto) {
  mobileKonto.onclick = function() {
    mobilePop.style.display = "block";
    $("body").css({ "overflow-y": "hidden" });
  };
}

function hideDiv() {
  if ($(window).width() > 920) {
    if (mobilePop) {
      mobilePop.style.display = "none";
    }
  }
}

//run on document load and on window resize
$(document).ready(function() {
  //on load
  hideDiv();

  //on resize
  $(window).resize(function() {
    hideDiv();
  });
});

// When the user clicks the button, open the modal
rbtn.onclick = function() {
  rmodal.style.display = "flex";
};

lbtn.onclick = function() {
  lmodal.style.display = "flex";
};

// When the user clicks on <span> (x), close the modal
rspan.onclick = function() {
  rmodal.style.display = "none";
};

lspan.onclick = function() {
  lmodal.style.display = "none";
};

cookies();

function cookies() {
  document.body.innerHTML +=
    '\
                <div class="cookieconsent" style="position:fixed;padding:20px;left:0;bottom:0;background-color:#000;color:#FFF;text-align:center;width:100%;z-index:99999;">\
                    Diese Seite benutzt Cookies. Mit dem benutzen der Seite, erklärst du dich mit der Nutzung von Cookies einverstanden. \
                    <a href="#" style="color:#CCCCCC;">Ich verstehe</a>\
                </div>\
                ';
  document.querySelector(".cookieconsent a").onclick = function(e) {
    e.preventDefault();
    document.querySelector(".cookieconsent").style.display = "none";
  };
}
