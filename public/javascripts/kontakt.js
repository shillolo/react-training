$("#buyer").click(function(){
    $(this).addClass("buyerclick");
    document.getElementById("buyer").style.borderBottom = "solid 2px #ff9900";
    document.getElementById("bakery").style.borderBottom = "solid 2px #b5b5b5";
    $("#bakery").removeClass("bakeryclick")
})

$(".bakery").click(function(){
    $(this).addClass("bakeryclick");
    document.getElementById("bakery").style.borderBottom = "solid 2px #ff9900";
    document.getElementById("buyer").style.borderBottom = "solid 2px #b5b5b5";
    $("#buyer").removeClass("buyerclick")
})