document.getElementById('getLocationButton').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var locationData = { latitude: latitude, longitude: longitude };
            var iframe = document.getElementById('miIframe').contentWindow;
            iframe.postMessage(locationData, '*');
        });
    } else {
        console.error("La geolocalización no está soportada por este navegador.");
    }
});
