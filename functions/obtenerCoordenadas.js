exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    try {
        const { latitude, longitude } = await obtenerCoordenadasDesdeNavegador();

        return {
            statusCode: 200,
            body: JSON.stringify({ latitude, longitude })
        };
    } catch (error) {
        console.error('Error obteniendo coordenadas:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error obteniendo coordenadas' })
        };
    }
};

const obtenerCoordenadasDesdeNavegador = () => {
    return new Promise((resolve, reject) => {
        // L�gica para obtener coordenadas aqu�
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            error => {
                console.error('Error obteniendo la ubicaci�n:', error.message);
                reject(error);
            }
        );
    });
};
