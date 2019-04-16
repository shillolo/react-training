$('#credit-method').click(function() {
    document.getElementById("creditcard").checked = true;
    $("#über-info").slideUp();
    paynone();
    addReq();
    document.getElementById("chargebtn").type = "submit";
    $("#chargebtn").removeClass("disabled");
})

$('#überweisung-method').click(function() {
    document.getElementById("überweisung").checked = true;
    $("#chargebtn").addClass("disabled");
    paynone();
    removeReq();
    document.getElementById("chargebtn").type = "button"
    $("#über-info").slideDown({
        start: function () {
        $(this).css({
            display: "block"
        })
    }})
})

$('#paypal-method').click(function() {
    document.getElementById("paypal").checked = true;
    document.getElementById("payinfo").style.display = "block";
    document.getElementById("klarinfo").style.display = "none";
    standard();
    removeReq();
})

$('#sofort-method').click(function() {
    document.getElementById("sofort").checked = true;
    document.getElementById("klarinfo").style.display = "block";
    document.getElementById("payinfo").style.display = "none";
    standard();
    removeReq();
})

function standard(){
    document.getElementById("chargebtn").type = "submit";
    $("#chargebtn").removeClass("disabled");
    $("#über-info").slideUp();
}

function paynone() {
    document.getElementById("payinfo").style.display = "none";
    document.getElementById("klarinfo").style.display = "none";
}

function addReq(){
    $("#credentials input").prop('required', true);
}

function removeReq(){
    $("#credentials input").prop('required', false);
}

$("#chargebtn").click(function(){
    var creditCheck = document.getElementById("creditcard");
    var paypalCheck = document.getElementById("paypal");
    var sofortCheck = document.getElementById("sofort");
    var gesamt = document.getElementById("guthaben").value;
    if(isNaN(gesamt) || gesamt == "" || gesamt < 5 || gesamt > 200 ){
        console.log("fail")
    } else {
        gesamt = parseFloat(Math.round((gesamt) * 100) / 100).toFixed(2)
        $("#chargebtn").attr("type", "button");
        if ( creditCheck.checked == true){
            $("#credit-close").parent().parent().css({
                display: "flex"
            })
            document.getElementById("guthaben-cred").value = gesamt;
            $("#total-price").html("Gesamt: <b>"+ gesamt + " Euro</b>")
        } else if (paypalCheck.checked == true || sofortCheck.checked == true){
            $("#chargebtn").attr("type", "submit");
        }
        else{}
    }
})

$("#credit-close").click(function(){
    $(this).parent().parent().css({
        display: "none"
    })
})