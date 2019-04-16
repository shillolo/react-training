var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

$(function(){
    // Check the initial Position of the fixed_nav_container
    var stickyHeaderTop = $('#searchform').offset().top;

    $(window).scroll(function(){
            if( $(window).scrollTop() > stickyHeaderTop ) {
                    $('#searchform').css({position: 'fixed', top: '0px', marginTop: "0px", padding: "20px 0px", backgroundColor: "#5b0000"}); 
            } else {
                    $('#searchform').css({position: 'relative', top: '0px', marginTop: "100px", backgroundColor: "transparent"});
            }
    });
})