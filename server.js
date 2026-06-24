const express = require('express');
const prerenderNode = require('prerender-node');

// Configuración con mejor manejo de errores
const prerenderOptions = {
  port: 3000,
  crawlerPort: 3001,
  prerender: true,
  prerenderAfter: "document.querySelector('.app') && document.querySelector('.app').classList.contains('hydrated')",
  ignoreUrls: [
    "/api/*",
    "/admin/*",
    "/console/*",
    "/login",
    "/register",
    "/inscribirse",
    "/pagar"
  ],
  maxConcurrentRenders: 8,
  maxTotalRenders: 100,
  timeout: 60000,
  saveData: true,
  browserOptions: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    ]
  }
};

const app = express();

// Usar prerender-node middleware con opciones
app.use(prerenderNode(prerenderOptions));

app.use(express.static('dist'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log('🌐 Crawlers serán redirigidos a prerender-node');
});