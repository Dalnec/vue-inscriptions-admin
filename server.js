const express = require('express');
const prerenderNode = require('prerender-node');

const app = express();

// Usar prerender-node como middleware
app.use(prerenderNode);

// Servir archivos estáticos
app.use(express.static('dist'));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log('🌐 Crawlers serán redirigidos a prerender-node');
});