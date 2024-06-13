// Check if a new cache is available on page load.
window.addEventListener('load', function (e) {
    if ("serviceWorker" in navigator) {
        // using ServiceWorker caching API
        navigator.serviceWorker.register('sw.js').then(function (registration) {
            // Registration was successful
            console.debug('OpenEvent: ServiceWorker registration successful with scope: ', registration.scope);
            registration.addEventListener('updatefound', () => {
                // An updated service worker has appeared in reg.installing!
                outdatedVersion = true;
                _showError('Nueva versión de plugin fue descargada. Por favor vuelve a entrar.');

                var newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    // Has service worker state changed?
                    console.log("OpenEvent: New ServiceWorker state: ", newWorker.state);

                    switch (newWorker.state) {
                        case 'installed':
                            // There is a new service worker installed
                            if (navigator.serviceWorker.controller) {
                                newWorker.postMessage({ action: 'skipWaiting' });
                            }
                            break;
                        case 'activated':
                            console.warn("OpenEvent: New ServiceWorker activated, page reload is required");
                            break;
                    }
                });
            });
        }).catch(function (err) {
            // registration failed :(
            _showError('ServiceWorker no registrado: ' + err);
        });

        setTimeout(_onPluginReady, 500);
    }

    else if ("applicationCache" in navigator) {
        window.applicationCache.addEventListener('updateready', function (e) {
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                console.log('OpenEvent: new version downloaded');
                //window.location.reload();
                outdatedVersion = true;
                _showError('Nueva versión de plugin fue descargada. Por favor vuelve a entrar.');
            } else {
                // Manifest didn't changed. Nothing new to server.
                //_onPluginReady();
            }
        }, false);
        // async execution
        setTimeout(_onPluginReady, 0);
    }

    else {
        // fallback to online version
        console.warn("OpenEvent: Neither ServiceWorker nor AppCache API available. Falling back to non-cached version");
        setTimeout(_onPluginReady, 0);
    }
}, false);

function _onPluginReady() {
    var openerLocation;
    if (window.opener != null) {
        openerLocation = window.opener.document.location.href;
    } else {
        openerLocation = '';
    }
    if (window != parent)
        eventTarget = _getDomain(document.referrer);
    else
        eventTarget = _getDomain(openerLocation);

    // Firefox strange behaviour: https://stackoverflow.com/questions/64135423/serviceworker-losts-parents-referrer-on-firefox
    if (eventTarget == '')
        eventTarget = '*';

    console.log('OpenEvent: plugin loaded, eventTarget: ' + eventTarget +
        ', referrer: ' + document.referrer + ', openerLocation: ' + openerLocation);
    window.addEventListener("message", _receiveMessage, false);

    _sendMessage({ "apiVersion": 1, "method": "ready" });
};

function _receiveMessage(event) {
    var data = JSON.parse(event.data);
    switch (data.method) {
        case 'open':
            _pluginOpen(data);
            break;
        case 'error':
            var errors = JSON.stringify(data.errors, null, 2);
            _showError(errors);
            break;
        default:
            _showError("Invalid message format");
    }
};

function _getDomain(url) {
    if (url != '') {
        if (url.indexOf("://") > -1) {
            var parts = url.split('/');
            return parts[0] + "//" + parts[2];
        } else {
            return url.split('/')[0];
        }
    }
    return '';
};

function _sendMessage(data) {
    var buffer;
    if (typeof data === 'string') {
        buffer = data;
    } else {
        buffer = JSON.stringify(data);
    }

    console.log("OpenEvent: sending message to " + eventTarget + "\n", buffer);
    if (eventTarget != null && eventTarget != '') {
        parent.postMessage(buffer, eventTarget);
    }
};

function _pluginOpen(toaMessage) {
    if (outdatedVersion) {
        console.log('OpenEvent: open message on outdated version');
        return;
    }

    var _toa = toaMessage;
    var pre = document.getElementById("message_body");
    var pre2 = document.getElementById("message_body2");
    var actuacionCodigo = document.getElementById("actuacionCodigo");
    var acceso = document.getElementById("tipoAcceso");
    var cliente = document.getElementById("ani");
    var aid = document.getElementById("aid");
    var subtipoCliente = document.getElementById("subtipoCliente");

    aid.value = _toa.activity.aid;
    pre2.value = _toa.activity.XA_ACCESS_ID;
    actuacionCodigo.value = _toa.activity.XA_WORK_TYPE;
    acceso.value = _toa.activity.XA_ACCESS_TECHNOLOGY;
    cliente.value = _toa.activity.customer_number;
    subtipoCliente.value = _toa.activity.XA_CUSTOMER_SUBTYPE;

    if (_toa.securedData.Usuario != "ceaPlugins" || _toa.securedData.Contraseña != "ceaPlugins") {
        this._close();
    }

    // Captura las coordenadas cuando el plugin se abre
    captureGeolocation(_toa.activity.aid, _toa.activity.XA_ACCESS_ID);
};

function captureGeolocation(tecnicoId, ordenId) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => sendPosition(position, tecnicoId, ordenId),
            showError
        );
    } else {
        alert('La geolocalización no es soportada por este navegador.');
    }
}

function sendPosition(position, tecnicoId, ordenId) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const timestamp = new Date().toISOString();

    // Simulación de almacenamiento en CSV
    console.log(`Técnico ID: ${tecnicoId}, Orden ID: ${ordenId}, Latitud: ${latitude}, Longitud: ${longitude}, Timestamp: ${timestamp}`);

    // Aquí puedes agregar la lógica para enviar los datos a un servidor o guardarlos en un archivo.
    alert(`Coordenadas capturadas:\nLatitud: ${latitude}\nLongitud: ${longitude}`);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert('El usuario denegó la solicitud de geolocalización.');
            break;
        case error.POSITION_UNAVAILABLE:
            alert('La información de ubicación no está disponible.');
            break;
        case error.TIMEOUT:
            alert('La solicitud para obtener la ubicación del usuario ha expirado.');
            break;
        case error.UNKNOWN_ERROR:
            alert('Ocurrió un error desconocido.');
            break;
    }
}

function _close() {
    var message = {
        "apiVersion": 1,
        "method": "close",
        "backScreen": "default"
    };
    _sendMessage(message);
}

function _showError(message) {
    var buffer = '';
    if (typeof message === 'string') {
        buffer = message;
    } else if (message instanceof Error) {
        buffer = message.message;
    } else {
        buffer = JSON.stringify(message, null, 2);
    }

    console.error("OpenEvent: unexpected error:\n", buffer);

    var error = document.getElementById('error');
    error.textContent = buffer;
}
