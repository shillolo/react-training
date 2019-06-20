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
  var dots = document.getElementsByClassName("dotSlide");
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

console.log(window.screen.width);
console.log("hi")

var AlignersIndex = 1;
showAligners(AlignersIndex);

function plusAligners(n) {
  showAligners(AlignersIndex += n);
}

function currentAligners(n) {
  showAligners(AlignersIndex = n);
}

function showAligners(n) {
  var i;
  var slides = document.getElementsByClassName("align");
  var dots = document.getElementsByClassName("dotAlign");
  console.log(slides.length)
  if (n > slides.length) {AlignersIndex = 1}    
  if (n < 1) {AlignersIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[AlignersIndex-1].style.display = "flex";  
  dots[AlignersIndex-1].className += " active";
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

document.querySelector('p').addEventListener('touchstart', f);
        document.querySelector('p').addEventListener('touchend', f);
        document.querySelector('p').addEventListener('touchmove', f);
        
        function f(ev){
            console.log( ev.touches, ev.type );
        }

$('.wrapper').parallax({
  speed: 0.4
})

function changeColor(){
  var bodys = $(".highEnd")
  console.log(bodys.css('color'))
  if (bodys.css('display') == "none"){
    bodys.css('display', "inline");
    bodys.css('color', "#ff9900");
    $("#bakery3").attr("src","../images/bakery3King.png");
    $("#bakery3Main").attr("src","../images/bakery3King.png");
    $("#crownMode").css({backgroundColor: "white"});
    $("#crownMode").css("color", "#ff9900");
    document.getElementById("thirdSlide").innerHTML = "Code in gewählter Bäckerei eingeben und Brötchen genießen"
    document.getElementById("thirdText").innerHTML = "3. Code in gewählter Bäckerei eingeben und Brötchen genießen"
    // $(".wrapper").css("margin-top", "500px");
  } else {
    bodys.css('display', "none");
    bodys.css('color', "black");
    $("#bakery3").attr("src","../images/bakery3.png");
    $("#bakery3Main").attr("src","../images/bakery3.png");
    $("#crownMode").css({backgroundColor: "#ff9900"});
    $("#crownMode").css("color", "white");
    $(".premium").css("display", "none");
    document.getElementById("thirdSlide").innerHTML = "Brötchentüte am Brotritterschild in der Bäckerei abholen"
    document.getElementById("thirdText").innerHTML = "3. Brötchentüte am Brotritterschild in der Bäckerei abholen"
  }
}

$("#chargebtn").click(function(){
  document.getElementById("whatpop").style.display = "flex"
})

$(".closeinst").click(function(){
  $(this).parent().parent().css({
      display: "none"
  })
})

ScrollReveal({ reset: true }).reveal('.coool', { delay: 22100 });