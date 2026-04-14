/**
 * Actualiza el favicon del documento, incluyendo soporte para dispositivos móviles.
 * Convierte imágenes remotas a dataURL para máxima compatibilidad.
 */
export const setFavicon = (href: string) => {
    if (href.startsWith("http")) {
        // Convertir imagen remota a dataURL via canvas
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, 64, 64);
            applyFavicon(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
            // Fallback: usar la URL directamente si no se puede convertir
            applyFavicon(href);
        };
        img.src = href;
    } else {
        applyFavicon(href);
    }
};

function applyFavicon(dataUrl: string) {
    const rels = ["icon", "shortcut icon", "apple-touch-icon"];

    // Eliminar TODOS los link de favicon existentes
    document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    ).forEach((el) => el.remove());

    // Crear nuevos elementos link
    rels.forEach((rel) => {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = dataUrl;
        document.head.appendChild(link);
    });
}

