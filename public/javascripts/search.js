var locationForm = document.getElementById('location-form')

locationForm.addEventListener('submit', saveLoc)

function saveLoc(){
    var location = document.getElementById('location-input').value;
    sessionStorage.setItem('location', location)
}