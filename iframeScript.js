window.addEventListener('message', function(event) {
    var locationData = event.data;
    var coords = "Latitud: " + locationData.latitude + "<br>Longitud: " + locationData.longitude;
    document.getElementById("demo").innerHTML = coords;
});
