const prerender = require('prerender');

// Configuración
const options = {
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
  timeout: 30000,
  saveData: true,
  browserOptions: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor"
    ]
  }
};

console.log('🚀 Iniciando servidor prerender...');
const server = prerender(options);

server.start()
  .then(() => {
    console.log('✅ Servidor prerender iniciado en el puerto 3000');
    console.log('🌐 Los crawlers serán redirigidos al prerender-node');
  })
  .catch(err => {
    console.error('❌ Error iniciando servidor prerender:', err);
    process.exit(1);
  });