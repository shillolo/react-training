jQuery(document).ready(function() {
  $("#tab1").addClass("tabchange");
  $("#order-holder").addClass("tab13");
});

jQuery(document).ready(function() {
  setTimeout(function() {
    document.getElementById("code-container").style.display = "block";
  }, 1500);
});

$("#tab1").click(function() {
  $(this).addClass("tabchange");
  $("#tab2").removeClass("tabchange");
  $("#tab3").removeClass("tabchange");
  $("#order-holder").addClass("tab13");
  $("#code-holder").removeClass("tab2");
  $("#receive-time-holder").removeClass("tab13");
});

$("#tab3").click(function() {
  $(this).addClass("tabchange");
  $("#tab1").removeClass("tabchange");
  $("#tab2").removeClass("tabchange");
  $("#receive-time-holder").addClass("tab13");
  $("#code-holder").removeClass("tab2");
  $("#order-holder").removeClass("tab13");
});

$("#what").click(function() {
  document.getElementById("whatpop").style.display = "flex";
});

$(".closeinst").click(function() {
  $(this)
    .parent()
    .parent()
    .css({
      display: "none"
    });
});

var smodal = document.getElementById("whatpop");

window.onclick = function(event) {
  if (event.target == smodal) {
    smodal.style.display = "none";
  }
};
