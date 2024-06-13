const express = require('express');

const app = express();
const port = 3000; // Puedes cambiar el puerto según tu configuración

// Ruta para obtener las coordenadas
app.get('/obtener-coordenadas', (req, res) => {
  // Verificar si el navegador soporta la geolocalización
  if ("geolocation" in navigator) {
    // Solicitar coordenadas al navegador
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        res.json({ latitude, longitude });
      },
      error => {
        console.error('Error obteniendo la ubicación:', error.message);
        res.status(500).json({ error: 'Error obteniendo la ubicación' });
      }
    );
  } else {
    res.status(400).json({ error: 'Geolocalización no soportada por el navegador' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
