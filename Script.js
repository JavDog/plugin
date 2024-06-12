window.addEventListener('load', function() {
    // Este código se ejecutará cuando la página se haya cargado completamente
    if ("geolocation" in navigator) {
        // El navegador soporta geolocalización
        navigator.geolocation.getCurrentPosition(function(position) {
            //const div = document.getElementById('1');

            // Cambia el contenido del div
            //div.innerText = 'ok';
            var coords = "Latitud: " + position.coords.latitude + "<br>Longitud: " + position.coords.longitude;
            // Puedes hacer lo que quieras con las coordenadas, como mostrarlas en un mensaje
            alert("Coordenadas GPS:\n" + coords);
           

            
        }, function(error) {
            // Manejar errores
            console.error('Error obteniendo la ubicación:', error);
        });
    } else {
        // El navegador no soporta geolocalización
        alert("Lo siento, tu navegador no soporta geolocalización.");
    }
});
