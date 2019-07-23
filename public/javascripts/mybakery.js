
var confirm = $(".confirm")
var failure = $(".failure")
var confirmedFail = $(".delete")
var declinedFail = $(".goback")

confirm.on("click", function(){
    $(this).parent().siblings(".confirmer").val("confirm")
    $(this).parent().parent().parent().submit()
})


//not ready yet (sound nicht clean & 50000 keine 5 Minuten?)
window.setInterval(function(){
    var counter = 0
    $(".inner-container-two").each(function(){
        if ($(this).children(".fas-fa-check").html()){
            console.log("de")
        } else {
            var time = $(this).siblings(".inner-container-one").children(".time-holder").children("div").text().split(":");
            if (time[0] < new Date().getHours() && new Date().setHours(time[0], 0, 0, 0 ) - new Date().getTime() <= 1800000){
                counter++
            }
        }  
    })
    if (counter > 0){
        var audio = new Audio('../sounds/ding.mp3');
        audio.play();
    }
}, 300000)

// komischer bug manchmal
$(document).ready(function(){
var audio = new Audio('../sounds/ding.mp3');
audio.play();

})

failure.on("click", function(){
    $(this).parent().siblings(".confirmer").val("failure")
    $(this).parent().parent().siblings(".deleter").css({"display": "block"})
    console.log($(this).parent().parent().css({"display": "none"}))
})

confirmedFail.on("click", function(){
    $(this).parent().parent().parent().submit();
})

declinedFail.on("click", function(){
    $(this).parent().parent().siblings(".order-container").css({"display": "flex"});
    $(this).parent().parent().css({"display": "none"})
})

$(".section").click(function(){
    $(this).siblings(".sec").slideToggle();
    $(this).children("i").toggleClass("fa-angle-down" ).toggleClass("fa-angle-left")
})

$(".product").click(function(){
    console.log("bhf")
    $(this).parent().parent().submit()
})

$(".lsection").click(function(){
    var bradius = $(".lsection").css("border-bottom-left-radius")
    console.log(bradius)
    if (bradius == "30px"){
    $(".lsection").css({"border-bottom-left-radius": "0px"});
    $(".lsection").css({"border-bottom-right-radius": "0px"});
    $(".products").css({"border-bottom-left-radius": "0px"});
    $(".products").css({"border-bottom-right-radius": "0px"})
    } else {
    $(".products").css({"border-bottom-left-radius": "30px"});
    $(".products").css({"border-bottom-right-radius": "30px"});
    $(".lsection").css({"border-bottom-left-radius": "30px"});
    $(".lsection").css({"border-bottom-right-radius": "30px"});
    }
})

function changeFunc() {
    $("#killbuns").submit();
}

jQuery(document).ready(function() {
    document.getElementById("timepicker").value = document.getElementById("timereader").value
})

$(".closeStore").click(function(){
    $(".closepop").css({"display": "flex"})
})

$("#close").click(function(){
    $(".closepop").css({"display": "none"})
})

// display number of new orders
jQuery(document).ready(function() {
    var containers = $(".order").length;
    var checker = $(".inner-container-two");
    var counter = 0
    console.log(checker.length)
    for (var i = 0; i < checker.length; i++){
        var check = checker.eq(i).children().length
        console.log(check)
        if ( check == 3){
            counter++
        }
    }
    if (counter > 0){
        $("#message").html(counter);
    } else {
        $("#message").css({"display": "none"})
    }
})

$(".no").click(function(){
    $(".closepop").css({"display": "none"})
})

$("#deactivateClose").click(function(){
    $(".closepop").css({"display": "none"})
})

$(".yes").click(function(){
    $(".deactivate").submit()
})

var socket = io.connect('http://localhost:3000');
// socket.on('RefreshPage', function (data) {
//     console.log("works, go to bed")
// });
socket.emit("refresher")
socket.on('chatmessage', function(msg){
    var reloader = $("#reloader").val()
    if (msg > reloader)
    location.reload();
  });

  jQuery(document).ready(function() {
    $("#tab1").addClass("tabchange");
})

$("#tab1").click(function(){
    $(this).addClass("tabchange");
    $("#tab3").removeClass("tabchange");
    $(".orders").css({display: "block"});
    $(".availibility").css({display: "none"})
})

$("#tab3").click(function(){
    console.log("hi")
    $(this).addClass("tabchange");
    $("#tab1").removeClass("tabchange");
    $(".orders").css({display: "none"});
    $(".availibility").css({display: "flex"})
})

$(".redobutton").click(function () {
    $(this).parent().parent().parent().parent().siblings(".status").val("redo");
    $(this).parent().parent().parent().parent().parent().submit()
})