$(document).ready(function(){
        $(".datepicker").datepicker({
            dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
             dateFormat: 'dd.mm.yy',
            minDate: '+1d',
            maxDate: '+2m'
        });
    });

var inputs = $(".e-reader").length;

$(".datebtn").click(function(){
    $("#h-submit").click()
})

$(".timebtn").click(function(){
    $("#timesubmit").click()
})

$(document).ready(function(){
    $(".activeReader").change(function(){
        $(this).siblings(".fakebtn").css('display', 'none')
        $(this).siblings(".change-d").css('display', 'flex')
    });
});

$(document).ready(setTimeout(function(){
    $(".activeReader2").change(function(){
        $(this).siblings(".fakebtn").css('display', 'none')
        $(this).siblings(".change-d").css('display', 'flex')
    });
}, 500));

$(document).ready(function(){
    $(".activeReader2").each(function(){
        $(this).val(
           $(this).siblings("input").val()
        ) 
    })
});

$("#new").click(function(){
    document.getElementById("old-orders").style.display = "none";
    document.getElementById("active-orders").style.display = "block";
    document.getElementById("new").style.backgroundColor = "white";
    document.getElementById("new").style.color = "#ff9900";
    document.getElementById("old").style.backgroundColor = "transparent";
    document.getElementById("old").style.color = "black";
})

$("#old").click(function(){
    document.getElementById("active-orders").style.display = "none";
    document.getElementById("old-orders").style.display = "block";
    document.getElementById("old").style.backgroundColor = "white";
    document.getElementById("old").style.color = "#ff9900";
    document.getElementById("new").style.backgroundColor = "transparent";
    document.getElementById("new").style.color = "black";
})

$(".delete-order").click(function() {
        document.getElementById("delete-pop").style.display = "flex";
        document.getElementById('delete-pop').innerHTML = `
            <div class="pop-container" id="pop-container">
                <div class="header-container"><h2>Sind die sicher, dass sie diese Bestellung löschen wollen?</h2></div>
                <p>Der Gesamtpreis wird ihnen wieder auf ihr Konto gutgeschrieben</p>
                <div class="descision-maker">
                    <button class="delete-button" id="delete-button-true" type="button">Ja</button>
                    <p id="delete-button-false">Nicht Löschen</p>
                </div>
            </div>
    `     
     $("#order-input").val($(this).attr('id'));
})

$(document).on('click', "#delete-button-true", function() {
    $("#delete-submit").click()
})

$(document).on('click', "#delete-button-false", function() {
    $("#pop-container").remove();
    document.getElementById("delete-pop").style.display = "none";
})

