export const setMetaTags = (options: {
    description?: string
    image?: string
    title?: string
    type?: string
    url?: string
}) => {
    const {
        title = "Kdosh",
        description = "Plataforma de inscripciones para eventos",
        image = "/kadosh.png",
        url = window.location.href,
        type = "website"
    } = options;

    const tags: { property?: string; name?: string; content: string }[] = [
        { content: title, property: "og:title" },
        { content: description, property: "og:description" },
        { content: image, property: "og:image" },
        { content: type, property: "og:type" },
        { property: "og:url", content: url },
        { content: "summary_large_image", name: "twitter:card" },
        { content: title, name: "twitter:title" },
        { content: description, name: "twitter:description" },
        { content: image, name: "twitter:image" }
    ];

    // Remove existing OG/Twitter meta tags
    document.querySelectorAll<HTMLMetaElement>("meta[property^=\"og:\"], meta[name^=\"twitter:\"]").forEach((el) => el.remove());

    // Create new meta tags
    tags.forEach(({ property, name, content }) => {
        const meta = document.createElement("meta");
        if (property) meta.setAttribute("property", property);
        if (name) meta.setAttribute("name", name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
    });
};
