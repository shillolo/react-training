console.log(window.screen.width)

function initMap(){
var location = document.getElementById("location").value;
 console.log(document.getElementById("location").value);
    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params:{
        address:location,
        key:'AIzaSyA1dS0RAbz7L1hN9IMDmS2lpAbJtVZvaXc'
    }
    })
.then(function(response) {
    console.log(response);
        
        if (response.data.results[0] == undefined  ||  response.data.results[0] == null){
           var lat = 53.073635;
           var lng = 8.806422;
        } else {
           var lat = response.data.results[0].geometry.location.lat;
           var lng = response.data.results[0].geometry.location.lng;
        }

var options = {
    zoom:13,
    center:{lat:lat,lng:lng},
    styles: [
          {
            featureType: 'poi.business',
            stylers: [{visibility: 'off'}]
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{visibility: 'off'}]
          }
        ]
}
var map = new
google.maps.Map(document.getElementById('map'), options)


// Array of Markers
var markers = [{
    coords:{lat:42.4668,lng:-70.9495},
    content:'<h1>Haferkamp</h1>',
},
{
    coords:{lat:53.084810,lng:8.799534},
    content:'<div class="mapcontent" id="mapcontent">'+
    '<div class="mappic"></div>'+
    '<h3>H-H-Meier-Allee 43</h3>'+
    '<a href="/bakery">Zur Bäckerei</a>'+
    '</div>'
},
{
    coords:{lat:73.084810,lng:1.799534},
    content:'<div class="mapcontent" id="mapcontent">'+
    '<h1>Haferkamp</h1>'+
    '<div class="mappic"></div>'+
    '<p>Mo-Fr: 07:00 bis 15:00</p>'+
    '<p>Sa-So: 07:00 bis 12:00</p>'+
    '<h5>H-H-Meier-Allee 43</h5>'+
    '<a href="/bakery">Zur Bäckerei</a>'+
    '</div>'
},
{
    coords:{lat:40.4668,lng:-70.9495}
}
]

//loop through Markers
for(var i = 0; i < markers.length; i++){
    addMarker(markers[i])
}
        
if (screen.width < 960){
 var bigIcon = new google.maps.Size(70, 70);
} else {
 var bigIcon = new google.maps.Size(55, 55);
}


        
function addMarker(props){
    if (screen.width < 960){
    var marker = new google.maps.Marker({
        position:props.coords,
        map:map,
    scaledSize: new google.maps.Size(75, 75)
    })
    }else{
        var marker = new google.maps.Marker({
        position:props.coords,
        map:map,
    scaledSize: new google.maps.Size(45, 45)
    })
    }

    //check content
    if(props.content){
        var infoWindow = new google.maps.InfoWindow({
            content: props.content,
        });

        marker.addListener('click', function(){
            infoWindow.open(map, marker)
        })
    }
}
})
}

var mapscontents = document.getElementsByClassName("mapcontent");

for(var i = 0; i < mapscontents.length; i++) {
  mapscontents[i].addEventListener("click", function() {
    console.log("Clicked index: " + i);
  })
}

var mpop = document.getElementById("mapspop");
var mapsclose = document.getElementById("mapsclose");

window.onclick = function(event) {
    if (event.target == mpop) {
        mpop.style.display = "none";
        document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
}
}

$("#mapsclose").click(function(){
    mpop.style.display = "none";
    document.getElementsByTagName("BODY")[0].style.overflowY = "scroll";
})

$("#bakebtn").click(function(){
    mpop.style.display = "flex";
    document.getElementsByTagName("BODY")[0].style.overflowY = "hidden";
})