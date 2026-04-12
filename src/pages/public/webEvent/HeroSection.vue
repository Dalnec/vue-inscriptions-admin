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
    if ( !start) return hero.date_label;
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const startFormatted = format(s, "MMMM d", { locale: es });
    const endFormatted = e ? ` - ${ format(e, "d, yyyy", { locale: es }) }` : `, ${ format(s, "yyyy", { locale: es }) }`;
    return `${ startFormatted }${ endFormatted }`.toUpperCase();
});
</script>

<template>
    <div>

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
        </section>

    <!-- CONTENIDO HERO — fuera del slider para no taparlo -->
    <div class="hero-text-wrapper">
        <div class="hero-text-inner">
            <h1 class="hero-title motto-font">{{ eventTitle }}</h1>
            <p class="hero-verse">"{{ hero.verse }}"</p>
            <p class="hero-citation">{{ hero.citation }}</p>
            <div class="hero-date-badge">
                <span>📅 {{ eventDateLabel }}</span>
            </div>
        </div>
    </div>
    </div>
</template>

<style>

.section-hero {
    @apply relative flex flex-col items-center justify-center w-full;
    aspect-ratio: 16 / 9;
    max-height: 85vh;
    position: relative;
    z-index: 20;
    background: var(--event-bg);
    overflow: hidden;
}

@media (max-width: 768px) {
    .section-hero {
        aspect-ratio: 9 / 12;
        max-height: 70vh;
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
}

.hero-bg {
    @apply absolute inset-0 w-full h-full;
    object-fit: cover;
    filter: blur(30px) brightness(0.5);
    transform: scale(1.1);
}

.hero-blur-overlay {
    display: none;
}

.hero-overlay {
    @apply absolute inset-x-0 bottom-0;
    height: 15%;
    z-index: 4;
    pointer-events: none;
    background: linear-gradient(
        to bottom,
        transparent 0%,
        var(--event-bg) 100%
    );
}

/* BOTONES */
.nav-btn {
    @apply absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12;

    &.left {
        @apply left-2 md:left-4;
    }

    &.right {
        @apply right-2 md:right-4;
    }
}

/* BANNER INFO — debajo del slider */
.hero-text-wrapper {
    @apply text-center flex flex-col items-center w-full;
    position: relative;
    z-index: 30;
    background: var(--event-bg);
    padding: 1.25rem 1rem 1.5rem;
}

@media (min-width: 768px) {
    .hero-text-wrapper {
        padding: 1.5rem 2rem 2rem;
    }
}

.hero-text-inner {
    @apply flex flex-col items-center gap-2 md:gap-3 w-full;
    max-width: 700px;
}

/* TEXTOS */
.hero-title {
    @apply text-2xl md:text-4xl font-bold text-white;
    font-family: 'Poppins', sans-serif;
    letter-spacing: -0.5px;
}

.hero-verse {
    @apply text-sm md:text-lg font-semibold italic;
    color: var(--event-accent);
}

.hero-citation {
    @apply text-xs md:text-base text-white/60;
}

.hero-date-badge {
    @apply inline-flex items-center gap-2 font-bold text-sm md:text-base
    rounded-full mt-2;
    color: var(--event-accent);
    background: rgba(242, 120, 12, 0.1);
    border: 1px solid rgba(242, 120, 12, 0.25);
    padding: 0.4rem 1.2rem;
}

</style>