import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");
const API_BASE_URL = (process.env.VITE_API_URL).replace(/\/+$/, "");
const PORT = parseInt(process.env.PORT, 10);

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json; charset=utf-8",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".webp": "image/webp"
};

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

let indexHtml;
try {
    indexHtml = fs.readFileSync(path.join(DIST_DIR, "index.html"), "utf-8");
} catch {
    console.error("index.html not found in dist directory");
    process.exit(1);
}

async function fetchEventData(slug) {
    const cached = cache.get(slug);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
    }
    try {
        const url = `${ API_BASE_URL }/api/activity/?shortname=${ encodeURIComponent(slug) }`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            const event = Array.isArray(data) && data.length > 0 ? data[0] : null;
            cache.set(slug, { data: event, ts: Date.now() });
            return event;
        }
    } catch {
    }
    return null;
}

function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resolveImageUrl(logo) {
    if ( !logo) return "/kadosh.png";
    if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
    return `${ API_BASE_URL }${ logo.startsWith("/") ? "" : "/" }${ logo }`;
}

function injectMetaTags(html, event, requestUrl) {
    const title = esc(event.title || event.shortname || "Kdosh");
    const description = esc(event.description || "Plataforma de inscripciones para eventos");
    const image = esc(resolveImageUrl(event.logo));
    const url = esc(requestUrl);
    return html.replace(/<meta property="og:title"[^>]*>/,
        `<meta property="og:title" content="${ title }">`).replace(/<meta property="og:description"[^>]*>/,
        `<meta property="og:description" content="${ description }">`).replace(/<meta property="og:image"[^>]*>/,
        `<meta property="og:image" content="${ image }">`).replace(/<meta property="og:url"[^>]*>/,
        `<meta property="og:url" content="${ url }">`).replace(/<meta name="twitter:title"[^>]*>/,
        `<meta name="twitter:title" content="${ title }">`).replace(/<meta name="twitter:description"[^>]*>/,
        `<meta name="twitter:description" content="${ description }">`).replace(/<meta name="twitter:image"[^>]*>/,
        `<meta name="twitter:image" content="${ image }">`).replace(/<title>[^<]*<\/title>/, `<title>${ title }</title>`);
}

const knownPaths = new Set([ "/", "/console", "/login", "/favicon.ico", "/robots.txt", "/kadosh.png" ]);

function isEventSlug(pathname) {
    if (knownPaths.has(pathname)) return false;
    const segments = pathname.split("/").filter(Boolean);
    return segments.length === 1 && !path.extname(segments[0]);
}

const server = http.createServer(async(req, res) => {
    try {
        const parsedUrl = new URL(req.url, `http://${ req.headers.host || "localhost" }`);
        let pathname = parsedUrl.pathname;

        if (isEventSlug(pathname)) {
            const slug = pathname.slice(1);
            const event = await fetchEventData(slug);
            const html = event
                         ? injectMetaTags(indexHtml, event, `https://${ req.headers.host }${ pathname }`)
                         : indexHtml;
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(html);
            return;
        }

        let filePath = path.join(DIST_DIR, pathname === "/" ? "index.html" : pathname);
        const ext = path.extname(filePath);

        if ( !ext) {
            filePath = path.join(DIST_DIR, "index.html");
        }

        const content = await fs.promises.readFile(filePath);
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
    } catch {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(indexHtml);
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${ PORT }`);
});
