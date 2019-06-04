
var confirm = $(".confirm")
var failure = $(".failure")
var confirmedFail = $(".delete")
var declinedFail = $(".goback")

confirm.on("click", function(){
    $(this).parent().siblings(".confirmer").val("confirm")
    $(this).parent().parent().parent().submit()
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