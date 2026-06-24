import prerender from "prerender-node";

// Configuración con mejor manejo de errores
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

console.log("🚀 Iniciando servidor prerender...");

// Middleware para logs
const onRequest = (req, res) => {
    console.log(`📝 ${ req.method } ${ req.url }`);
    prerender.server.onRequest(req, res);
};

prerender.server.onRequest = onRequest;

prerender.start(options).then(() => {
    console.log("Server started in port 3000");
    console.log("Crawlers will be redirect to prerender-node");
}).catch(err => {
    console.error("Failed tryng to start prerender server:", err);
    process.exit(1);
});