
var cartBadgeHtml = document.getElementById("cart-badge").innerHTML

var dropDownValue = document.getElementById("dropdown");

var dropDownValueM = document.getElementById("dropdown-mobile");

function signup(){
    smodal.style.display = "none";
    document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
    document.getElementById('loginpop').style.display = "flex"
}

$("#popclose1").click(function(){
    document.getElementById("emailpop").style.display = "none"
    document.getElementById("infopop").style.display = "none"
})

$("#popclose2").click(function(){
    document.getElementById("datepop").style.display = "none"
    document.getElementById("infopop").style.display = "none"
})

$("#popclose3").click(function(){
    document.getElementById("timepop").style.display = "none"
    document.getElementById("infopop").style.display = "none"
})

$("#nocost").click(function(){
    document.getElementById("feepop").style.display = "block"
    document.getElementById("infopop").style.display = "flex"
})

$("#question1").click(function(){
    document.getElementById("emailpop").style.display = "block"
    document.getElementById("infopop").style.display = "flex"
})

$("#question2").click(function(){
    document.getElementById("datepop").style.display = "block"
    document.getElementById("infopop").style.display = "flex"
})

$("#question3").click(function(){
    document.getElementById("timepop").style.display = "block"
    document.getElementById("infopop").style.display = "flex"
})

$("#button1").click(function(){
    document.getElementById("box1").style.display = "none";
    document.getElementById("box2").style.display = "flex";
    document.getElementById("head1").style.fontWeight = "300";
    document.getElementById("head1").style.color = "black";
    document.getElementById("head2").style.fontWeight = "700";
    document.getElementById("head2").style.color = "#ff9902";
})

$("#button2").click(function(){
    document.getElementById("box2").style.display = "none";
    document.getElementById("box3").style.display = "flex";
    document.getElementById("head2").style.fontWeight = "300";
    document.getElementById("head2").style.color = "black";
    document.getElementById("head3").style.fontWeight = "700";
    document.getElementById("head3").style.color = "#ff9902";
})

$("#goBack1").click(function(){
    document.getElementById("box2").style.display = "none";
    document.getElementById("box1").style.display = "flex";
    document.getElementById("head2").style.fontWeight = "300";
    document.getElementById("head2").style.color = "black";
    document.getElementById("head1").style.fontWeight = "700";
    document.getElementById("head1").style.color = "#ff9902";
})

$("#goBack2").click(function(){
    document.getElementById("box3").style.display = "none";
    document.getElementById("box2").style.display = "flex";
    document.getElementById("head3").style.fontWeight = "300";
    document.getElementById("head3").style.color = "black";
    document.getElementById("head2").style.fontWeight = "700";
    document.getElementById("head2").style.color = "#ff9902";
})

if ($(".loginpop")){
    var fee = 0.46;
} else {
    var fee = 0
};

$(document).ready(function(){
  // Add smooth scrolling to all links
  $("a").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
   
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });
});

function orderIt(){
    console.log($("#warenkorb").children().length)
        for (var i = 0; i < $("#warenkorb").children().length; i++) {
        var order = document.createElement('div');
        var a = $(".order")[i].children[0].innerHTML;
        var b = $(".input")[i].value;
        console.log(a);
        console.log(b)
        order.className = 'zettel';
        order.id = 'zettel_'+i
        document.getElementsByClassName('sorder')[0].appendChild(order);
        document.getElementById('zettel_'+i).innerHTML = `
            <div class="mini-container">
                <input type="hidden" name="getname" class=""getname value=${a}>
                <input type="hidden" class="hidden-total" name=${a} value=${b}>
                <div name="col" class="sname">${a}</div>
                <div class="snumber-holder">
                    <i class="fas fa-plus"></i>
                    <input class="hiddenprice" type="hidden" readonly>
                    <input class="snumber" value=${b} readonly>
                    <i class="fas fa-minus"></i>
                </div>
            </div>  
    `      
    }
    $("#getnumber").val($("#sorder").children().length);
    document.getElementById("total-price").innerHTML = parseFloat(Math.round((document.getElementById("number").innerHTML ) * 100) / 100).toFixed(2);
    document.getElementById("unreal-total").innerHTML = parseFloat(Math.round((document.getElementById("number").innerHTML - (-fee)) * 100) / 100).toFixed(2).replace(".", ",");
    }

$(".product").click(function() {
    var contentPanelId = jQuery(this).attr("id");
    var warenkorb_length = $("#warenkorb").children().length;
    var price = $(this).find(".realprice").text();
    if (document.getElementById('order_'+contentPanelId)) {
            $("#input_"+contentPanelId).val( function(i, oldval) {
                return ++oldval;
            });
    } else {
        var order = document.createElement('div');
        order.className = 'order';
        order.id = 'order_'+contentPanelId
        document.getElementsByClassName('warenkorb')[0].appendChild(order);
        document.getElementById('order_'+contentPanelId).innerHTML = `
            <p> ${contentPanelId} </p>  
            <div class="menuholder" id="menuholder">
                <i class="fas fa-plus-circle"></i>
                <input class="input" id="input_${contentPanelId}" type="text" value="1" readonly>
                <i class="fas fa-minus-circle"></i>
                <input class="hinput" id="hinput_${contentPanelId}" type="hidden" value="1">
            </div>
    `      
    }
    var t = document.getElementById("number").innerHTML - -price
    var e = parseFloat(Math.round(t * 100) / 100).toFixed(2);
    document.getElementById("number").innerHTML = e;
    document.getElementById("realnumber").innerHTML = e.replace(".", ",");
    document.getElementById("cart-price").innerHTML = (e.replace(".", ",")+" &#8364;");
    document.getElementById("cart-badge").innerHTML = document.getElementById("cart-badge").innerHTML - -1 ;
    document.getElementById("hinput_"+contentPanelId).value = price
})

$(".infocircle").click(function() {
    document.getElementById($(this).attr('id')).style.display = "block"
    document.getElementById('extra').style.display = "flex"
})

$(document).on('click', ".fa-plus-circle", function() {
    $(this).siblings('.input').val( function(i, oldval) {
                return ++oldval;
    });
    var t = document.getElementById("number").innerHTML - -($(this).siblings('.hinput').val());
    var e = parseFloat(Math.round(t * 100) / 100).toFixed(2);
    document.getElementById("number").innerHTML = e;
    document.getElementById("realnumber").innerHTML = e.replace(".", ",");
    document.getElementById("cart-badge").innerHTML = document.getElementById("cart-badge").innerHTML - -1 
});

$(document).on('click', ".fa-minus-circle", function() {
    $(this).siblings('.input').val( function(i, oldval) {
                if (oldval <= 1) {
                    $(this).parent().parent().remove()
                } else {
                    return --oldval;
                }
    });
    var t = document.getElementById("number").innerHTML - $(this).siblings('.hinput').val();
    var e = parseFloat(Math.round(t * 100) / 100).toFixed(2);
    document.getElementById("number").innerHTML = e;
    document.getElementById("realnumber").innerHTML = e.replace(".", ",");
    document.getElementById("cart-badge").innerHTML = document.getElementById("cart-badge").innerHTML - 1 
    $(".sorder").empty();
});

$(document).on('click', ".fa-plus", function() {
    $(this).siblings('.snumber').val( function(i, oldval) {
                return ++oldval;
    });
    var total = document.getElementById("total-price").innerHTML;
    var breadname = $(this).parent().siblings()[0].value;
    var price = $("#"+breadname).children($(".productinfo")).children($(".iprice")).children(".realprice").text();
    document.getElementById("total-price").innerHTML = parseFloat(Math.round((total -(-price)) * 100) / 100).toFixed(2);
    document.getElementById("unreal-total").innerHTML = parseFloat(Math.round((total -(-price) - (-0.46)) * 100) / 100).toFixed(2).replace(".", ",");
    document.getElementById("number").innerHTML = document.getElementById("total-price").innerHTML;
    document.getElementById("realnumber").innerHTML = document.getElementById("total-price").innerHTML.replace(".", ",");
    $("#input_"+breadname).val( function(i, oldval) {
                return ++oldval;
    });
    document.getElementById("cart-badge").innerHTML = document.getElementById("cart-badge").innerHTML - -1 
});

$(document).on('click', ".fa-minus", function() {
    $(this).siblings('.snumber').val( function(i, oldval) {
                if (oldval <= 1) {
                    $(this).parent().parent().parent().remove();
                } else {
                    return --oldval;
                }
    });
    var breadname = $(this).parent().siblings()[0].value;
    $(this).parent().siblings()[1].value--;
    $("#input_"+breadname).val( function(i, oldval) {
                return --oldval;
    });
    var price = $("#"+breadname).children($(".productinfo")).children($(".iprice")).children(".realprice").text();
    var total = document.getElementById("total-price").innerHTML;
    document.getElementById("total-price").innerHTML = parseFloat(Math.round((total - (price)) * 100) / 100).toFixed(2);
    document.getElementById("unreal-total").innerHTML = parseFloat(Math.round(((total - (price)) - (- 0.46)) * 100) / 100).toFixed(2).replace(".", ",");
    var t = document.getElementById("number").innerHTML - (price);
    var e = parseFloat(Math.round(t * 100) / 100).toFixed(2);
    document.getElementById("number").innerHTML = e;
    document.getElementById("realnumber").innerHTML = e.replace(".", ",");
    if (document.getElementById("total-price").innerHTML == 0.00){
    document.getElementById("submitpop").style.display = "none";
    document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
    }
    if($("#input_"+breadname).val() == 0){
        $("#input_"+breadname).parent().parent().remove()
        $("#getnumber").val($("#sorder").children().length);
    }
document.getElementById("cart-badge").innerHTML = (document.getElementById("cart-badge").innerHTML -1)
});

$(function(){
    // Check the initial Position of the fixed_nav_container
    var stickyHeaderTop = $('#shopping-cart-container').offset().top;

    $(window).scroll(function(){
            if( $(window).scrollTop() > stickyHeaderTop ) {
                    $('#shopping-cart-container').css({position: 'fixed', top: '0px'});  
            } else {
                    $('#shopping-cart-container').css({position: 'relative', top: '0px'});
            }
    });
})


$(function(){
    // Check the initial Position of the fixed_nav_container
    var stickyHeaderTop2 = $('#content').offset().top;

    $(window).scroll(function(){
            if( $(window).scrollTop() > stickyHeaderTop2 ) {
                    $('#connector').css({position: 'fixed', top: '10px'});  
            } else {
                    $('#connector').css({position: 'absolute', bottom: '50'});
            }
    });
})

$("#trashbag").click(function() {
    $("#warenkorb").children().remove();
    $(".zettel").remove();
    var e = parseFloat(Math.round(0 * 100) / 100).toFixed(2);
    document.getElementById("number").innerHTML = e;
    document.getElementById("realnumber").innerHTML = e.replace(".", ",");
    document.getElementById("cart-badge").innerHTML = 0; 
})

$("#trashcan").click(function() {
    $("#warenkorb").children().remove();
    $(".zettel").remove();
    var e = parseFloat(Math.round(0 * 100) / 100).toFixed(2);
    document.getElementById("number").innerHTML = e;
    document.getElementById("realnumber").innerHTML = e.replace(".", ",");
    document.getElementById("cart-badge").innerHTML = 0; 
    priceDiv()
})

function priceDiv(){
    document.getElementById("cart-price").innerHTML = document.getElementById("number").innerHTML.replace(".", ",") + " &#8364;"
}

//run on document load and on window resize
$(document).ready(function () {
    //on load
    priceDiv();

    //on resize
    $(window).click(function(){
        priceDiv();
    });
});

$("#orderit").click(function() {
    creditAmount();
})

var ipop = document.getElementById('infopop');

if ($("#emailpop")){
var epop = document.getElementById("emailpop");
};

var dpop = document.getElementById("datepop");

var tpop = document.getElementById("timepop");

var fpop = document.getElementById("feepop");

var smodal = document.getElementById('submitpop');

var sbtn = document.getElementById("orderit");

var emodal = document.getElementById('extra');

var sspan = document.getElementsByClassName("close")[2];

var igredivs = document.getElementsByClassName("ingredient-container");

function warenkorb() {
    if ($("#warenkorb").children().length >= 1 ) {
    smodal.style.display = "flex";
    document.getElementsByTagName("BODY")[0].style.overflowY = "hidden";
    } else {
        return false
    }
}

window.onclick = function(event) {
    if (event.target == smodal) {
        smodal.style.display = "none";
        document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
        $(".zettel").remove()
    } else if (event.target == ipop){
        ipop.style.display = "none";
        if(epop){
        epop.style.display = "none";
        };
        dpop.style.display = "none";
        tpop.style.display = "none";
    }
}

document.onclick = function(event) {
    if (event.target == emodal) {
        emodal.style.display = "none";
        for (var i = 0; i < igredivs.length; i++){
            igredivs[i].style.display = "none"
        }
    }
}

$(".closesub").click(function(){
    $(this).parent().parent().css({
        display: "none"
    })
    document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
})

$(".closeing").click(function(){
    $(this).parent().parent().css({
        display: "none"
    });
    $(this).parent().css({
        display: "none"
    })
})

 $(document).ready(function(){
        $("#datepicker").datepicker({
            dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
             dateFormat: 'dd.mm.yy',
            minDate: '+1d',
            maxDate: '+2m'
        });
    });

    var datepicker = new Date();

//        function parseDate(input) {
//          var parts = input.match(/(\d+)/g);
//          // note parts[1]-1
//          return new Date(parts[2], parts[1]-1, parts[0]);
//        }

$(document).ready(function(){
var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
var day = currentDate.getDate();
var month = currentDate.getMonth() + 1
var year = currentDate.getFullYear()
var morgen = day + "." + month + "." + year 
    $('#datepicker').val(morgen);
     smodal.style.display = "none"
 })

$("#sub-close").click(function(){
    document.getElementById("submitpop").style.display = "none";
    document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
    $(".zettel").remove()
})

var interval;
var mousedown;
var timeout
$(document).on("mousedown", ".fa-plus-circle", function () {
    var plus = $(this)
    timeout = setTimeout(function(){
        interval = setInterval(function(){
            plus.click();
        }, 100);
    }, 500)
})
               
$(document).on("mouseup", window, function () {
    clearInterval(interval);
    clearTimeout(timeout)
  }
);

$("#shopping-cart").click(function(){
    if ($("#warenkorb").children().length >= 1 ) {
    creditAmount();
    } else {
        return false
    }
})

jQuery(document).ready(function() {
var right= $('#bakeryCon').height();
var left= $('#bakeryProducts').height();
if(left>right)
{
    document.getElementById('bakeryCon').style.height=(right-(-500))+"px";
}
})

$("#cart-price").click(function(){
    if ($("#warenkorb").children().length >= 1 ) {
    creditAmount();
    } else {
        return false
    }
})

function addReq(){
    $("#credentials input").prop('required', true);
}

function removeReq(){
    $("#credentials input").prop('required', false);
}

function removeScript(){
    $("#creditCheck").remove()
}

$('#credit-method').click(function() {
    document.getElementById("creditcard").checked = true;
    $("#credentials").slideDown({
        start: function () {
        $(this).css({
            display: "flex"
        })
    }})
    document.getElementById("payinfo").style.display = "none";
    document.getElementById("klarinfo").style.display = "none";
    addReq();
})

$('#paypal-method').click(function() {
    document.getElementById("paypal").checked = true;
    standard();
    document.getElementById("payinfo").style.display = "block";
    document.getElementById("klarinfo").style.display = "none";
    removeReq();
})

$('#sofort-method').click(function() {
    document.getElementById("sofort").checked = true;
    standard();
    document.getElementById("payinfo").style.display = "none";
    document.getElementById("klarinfo").style.display = "block";
    removeReq();
})


function standard(){
    $("#credentials").slideUp();
}

$(".section").click(function(){
    $(this).siblings(".sec").slideToggle();
    $(this).children("i").toggleClass("fa-angle-down").toggleClass("fa-angle-left")
})

$(document).on("mouseup", "body", function () {
    clearInterval(interval);
    clearTimeout(timeout)
  }
);

var head3 = document.getElementById("head3")

if (screen.width < 960){
    document.getElementById("head2").style.display = "none";
    if (head3){
    document.getElementById("head3").style.display = "none";
    }
    $("#button1").click(function(){
    document.getElementById("box1").style.display = "none";
    document.getElementById("box2").style.display = "flex";
    document.getElementById("head1").style.display = "none";
    if (head3){
    document.getElementById("head3").style.display = "none";
    }
    document.getElementById("head2").style.display = "block";
    })
    if(head3){
    $("#button2").click(function(){
        document.getElementById("box2").style.display = "none";
        document.getElementById("box3").style.display = "flex";
        document.getElementById("head1").style.display = "none";
        document.getElementById("head3").style.display = "block";
        document.getElementById("head2").style.display = "none";
    })
    }

    $("#goBack1").click(function(){
        document.getElementById("box2").style.display = "none";
        document.getElementById("box1").style.display = "flex";
        document.getElementById("head1").style.display = "block";
        if (head3){
        document.getElementById("head3").style.display = "none";
        }
        document.getElementById("head2").style.display = "none";
    })
    if(head3){
    $("#goBack2").click(function(){
        document.getElementById("box3").style.display = "none";
        document.getElementById("box2").style.display = "flex";
        document.getElementById("head1").style.display = "none";
        document.getElementById("head3").style.display = "none";
        document.getElementById("head2").style.display = "block";
    })
    }
}

$(document).on("mousedown", ".fa-minus-circle", function () {
    var minus = $(this)
    timeout = setTimeout(function(){
        interval = setInterval(function(){
            minus.click();
        }, 100);
    }, 500)
})
               
$(document).on("mouseup", ".fa-minus-circle", function () {
    clearInterval(interval);
    clearTimeout(timeout)
  }
);

function invalid(){
    document.getElementById("box3").style.display = "none";
    document.getElementById("box2").style.display = "flex";
    document.getElementById("head3").style.fontWeight = "300";
    document.getElementById("head3").style.color = "black";
    document.getElementById("head2").style.fontWeight = "700";
    document.getElementById("head2").style.color = "#ff9902";
}

function creditAmount() {
    if($("#creditAmount").innerHTML !== undefined){
        console.log($("#creditAmount").innerHTMl)
        var amount = (document.getElementById("creditAmount").innerHTML)
        var number = (document.getElementById("number").innerHTML);
        amount = parseFloat(amount);
        number = parseFloat(number);
        if ( amount < number ){
            document.getElementById("balken").innerHTML = "Nicht Genügend Guthaben!"
        } else {
            orderIt();
            warenkorb()
        }
    } else {
        orderIt();
        warenkorb()
    }
}

$("#order-btn").click(function(){
    if (!document.getElementById("e-reader").checkValidity()){
        $("#order-btn").attr("type", "submit");
    } else {
    var creditCheck = document.getElementById("creditcard");
    var paypalCheck = document.getElementById("paypal");
    var sofortCheck = document.getElementById("sofort");
    var gesamt = document.getElementById("number").innerHTML;
        gesamt = parseFloat(Math.round((gesamt) * 100) / 100).toFixed(2)
        $("#order-btn").attr("type", "button");
        if ( creditCheck.checked == true){
            var scontiner = $('#box1').clone();
            var scontiner2 = $('#box2').clone();
            $('#credit-checkout').append(scontiner);
            $('#credit-checkout').append(scontiner2);
            $("#credit-close").parent().parent().css({
                display: "flex"
            })
            $("#credit-checkout .scontainer").css({
                display: "none"
            })
            document.getElementById("guthaben-cred").value = gesamt;
            var t = document.createTextNode("Gesamt: "+ gesamt + " Euro");
            $("#header-price").html("Gesamt: <b>"+ gesamt + " Euro</b>")
        } else if (paypalCheck.checked == true || sofortCheck.checked == true){
            $("#order-btn").attr("type", "submit");
        }
    }
})

$("#credit-close").click(function(){
    $(this).parent().parent().css({
        display: "none"
    })
    $('#credit-checkout #box1').remove();
    $('#credit-checkout #box2').remove();
})

var rmodal = document.getElementById('loginpop');

var lmodal = document.getElementById('registerpop');

// Get the <span> element that closes the modal
var rspan = document.getElementById("closelog");

var lspan = document.getElementById("closereg");

// When the user clicks on <span> (x), close the modal
rspan.onclick = function() {
    $('#loginpop').css({display: "none"})
}

lspan.onclick = function() {
    $('#registerpop').css({display: "none"})
}
