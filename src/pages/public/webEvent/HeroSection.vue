<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject, computed, type Ref } from "vue";
import pageConfig from "@/assets/page_config.json";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const infoActivity = inject<Ref<InterfaceActivities>>("infoActivity");

const images = ref<string[]>([]);
const currentIndex = ref(0);

let interval: ReturnType<typeof setInterval> | null = null;

const nextImage = () => {
    if ( !images.value.length) return;
    currentIndex.value = (currentIndex.value + 1) % images.value.length;
};

const prevImage = () => {
    if ( !images.value.length) return;
    currentIndex.value =
        (currentIndex.value - 1 + images.value.length) % images.value.length;
};

const startAutoplay = () => {
    stopAutoplay();
    interval = setInterval(nextImage, 4000);
};

const stopAutoplay = () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
};

onMounted(async() => {
    const modules = import.meta.glob("@/assets/kadoshImg/*.{png,jpg,jpeg,webp}", { eager: true });

    images.value = Object.values(modules).map((mod: any) => mod.default);

    startAutoplay();
});

onUnmounted(() => stopAutoplay());

const { hero } = pageConfig;

const eventTitle = computed(() => infoActivity?.value?.title || hero.motto);
const eventDateLabel = computed(() => {
    const start = infoActivity?.value?.start_date;
    const end = infoActivity?.value?.end_date;
    if (!start) return hero.date_label;
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const startFormatted = format(s, "MMMM d", { locale: es });
    const endFormatted = e ? ` - ${ format(e, "d, yyyy", { locale: es }) }` : `, ${ format(s, "yyyy", { locale: es }) }`;
    return `${ startFormatted }${ endFormatted }`.toUpperCase();
});
</script>

<template>
    <section class="section-hero" @mouseenter="stopAutoplay"
             @mouseleave="startAutoplay">
        <!-- SLIDER -->
        <div class="hero-container">
            <div v-for="(img, index) in images" :key="img" :class="['hero-layer', index === currentIndex ? 'is-active' : 'is-hidden']">
                <div class="hero-image-wrapper">
                    <img :src="img" class="hero-bg" alt=""/>
                    <img :src="img" class="hero-blur-overlay" alt=""/>
                    <img :src="img" class="hero-main" alt=""/>
                </div>
            </div>
        </div>

        <!-- CONTROLES -->
        <Button @click="prevImage" rounded class="nav-btn left" #icon>
            <i-material-symbols-arrow-back-ios-new-rounded/>
        </Button>

        <Button @click="nextImage" rounded class="nav-btn right" #icon>
            <i-material-symbols-arrow-forward-ios-rounded/>
        </Button>

        <div class="hero-overlay"></div>

        <!-- CONTENIDO HERO -->
        <div class="hero-text-wrapper">
            <h1 class="hero-title motto-font">{{ eventTitle }}</h1>
            <p class="hero-verse">"{{ hero.verse }}"</p>
            <p class="hero-citation">{{ hero.citation }}</p>
            <div class="hero-date-badge">
                <p>📅 {{ eventDateLabel }}</p>
            </div>
        </div>
    </section>
</template>

<style>

.section-hero {
    @apply relative flex flex-col items-center justify-center w-full;
    aspect-ratio: 16 / 9;
    max-height: 85vh;
    position: relative;
    z-index: 20;

    background: linear-gradient(
        to bottom,
        var(--event-bg) 0%,
        var(--event-bg) 60%,
        rgba(37, 33, 70, 0.8) 75%,
        rgba(37, 33, 70, 0.4) 90%,
        var(--event-bg) 100%
    );
    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 1) 75%,
        rgba(0, 0, 0, 0.9) 85%,
        rgba(0, 0, 0, 0.6) 92%,
        rgba(0, 0, 0, 0.2) 97%,
        rgba(0, 0, 0, 0) 100%
    );

    -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 1) 75%,
        rgba(0, 0, 0, 0.9) 85%,
        rgba(0, 0, 0, 0.6) 92%,
        rgba(0, 0, 0, 0.2) 97%,
        rgba(0, 0, 0, 0) 100%
    );
}

@media (max-width: 768px) {
    .section-hero {
        aspect-ratio: 4 / 5;
        max-height: 75vh;
    }
}

/* CONTENEDOR GENERAL */
.hero-container {
    @apply absolute inset-0;
    z-index: 1;
}

/* CAPA POR SLIDE */
.hero-layer {
    @apply absolute inset-0 flex items-center justify-center;
    transition: opacity 700ms ease-in-out;
    opacity: 0;
    z-index: 1;
}

.hero-layer.is-active {
    opacity: 1;
    z-index: 2;
}

/* WRAPPER DE IMÁGENES */
.hero-image-wrapper {
    @apply absolute inset-0 flex items-center justify-center;
}

/* IMAGEN PRINCIPAL */
.hero-main {
    @apply absolute inset-0 w-full h-full;
    object-fit: contain;
    object-position: center;
    z-index: 2;
    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 1) 45%,
        rgba(0, 0, 0, 0.85) 60%,
        rgba(0, 0, 0, 0.6) 70%,
        rgba(0, 0, 0, 0.3) 80%,
        rgba(0, 0, 0, 0.1) 90%,
        rgba(0, 0, 0, 0) 100%
    );

    -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 1) 45%,
        rgba(0, 0, 0, 0.85) 60%,
        rgba(0, 0, 0, 0.6) 70%,
        rgba(0, 0, 0, 0.3) 80%,
        rgba(0, 0, 0, 0.1) 90%,
        rgba(0, 0, 0, 0) 100%
    );
}

.hero-bg {
    @apply absolute inset-0 w-full h-full;
    object-fit: cover;
    filter: blur(30px) brightness(0.6);
    transform: scale(1.1);
}

.hero-blur-overlay {
    @apply absolute inset-0 w-full h-full;
    object-fit: contain;
    object-position: center;
    z-index: 3;

    filter: blur(25px) brightness(0.6);
    transform: scale(1.08);

    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 40%,
        rgba(0, 0, 0, 0.2) 60%,
        rgba(0, 0, 0, 0.5) 75%,
        rgba(0, 0, 0, 0.8) 90%,
        rgba(0, 0, 0, 1) 100%
    );

    -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 40%,
        rgba(0, 0, 0, 0.2) 60%,
        rgba(0, 0, 0, 0.5) 75%,
        rgba(0, 0, 0, 0.8) 90%,
        rgba(0, 0, 0, 1) 100%
    );
}

.hero-overlay {
    z-index: 4;

    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 50%,
        rgba(0, 0, 0, 0.15) 65%,
        rgba(0, 0, 0, 0.4) 80%,
        rgba(0, 0, 0, 0.7) 92%,
        rgba(0, 0, 0, 0.95) 100%
    );
}

/* BOTONES */
.nav-btn {
    @apply absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12;

    &.left {
        @apply left-4;
    }

    &.right {
        @apply right-4;
    }
}

/* CARD HERO */
.hero-text-wrapper {
    @apply text-center text-white flex flex-col items-center gap-3
    absolute bottom-5 left-1/2 -translate-x-1/2 z-50
    py-6 px-8 rounded-xl shadow-lg;

    background: rgba(37, 33, 70, 0.88);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(242, 120, 12, 0.2);
}

/* TEXTOS */
.hero-title {
    @apply text-3xl md:text-6xl font-bold mb-2 text-white;
    font-family: 'Poppins', sans-serif;
    letter-spacing: -0.5px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-verse {
    @apply text-xl md:text-2xl font-semibold italic;
    color: var(--event-accent);
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.hero-citation {
    @apply text-lg md:text-xl text-white/70 mb-2;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-date-badge {
    @apply font-bold text-lg md:text-xl;
    color: var(--event-accent);
    border-top: 2px solid rgba(242, 120, 12, 0.4);
    padding-top: 1rem;
    margin-top: 0.5rem;
    width: 100%;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

</style>