<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import TimerEventPage from "@/pages/public/webEvent/TimerEventPage.vue";
import pageConfig from "@/assets/page_config.json";

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
    const modules = import.meta.glob("@/assets/images/*.{png,jpg,jpeg,webp}", { eager: true });

    images.value = Object.values(modules).map((mod: any) => mod.default);

    startAutoplay();
});

onUnmounted(() => stopAutoplay());

const { hero } = pageConfig;
</script>

<template>
    <section class="section-hero" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
        <!-- SLIDER -->
        <div class="hero-container">
            <div v-for="(img, index) in images" :key="img" :class="['hero-layer', index === currentIndex ? 'is-active' : 'is-hidden']">
                <img :src="img" class="hero-bg" alt=""/>
                <img :src="img" class="hero-main" alt=""/>
            </div>
        </div>

        <!-- CONTROLES -->
        <Button @click="prevImage" rounded class="nav-btn left" #icon>
            <i-material-symbols-arrow-back-ios-new-rounded/>
        </Button>

        <Button @click="nextImage" rounded class="nav-btn right" #icon>
            <i-material-symbols-arrow-forward-ios-rounded/>
        </Button>

        <!-- CONTENIDO HERO -->
        <div class="hero-content">
            <div class="text-center text-white">
                <h1 class="text-4xl md:text-7xl font-info font-bold mb-4">
                    {{ hero.motto }}
                </h1>
                
                <p class="text-lg md:text-2xl text-amber-400 mb-2 font-semibold">
                    "{{ hero.verse }}"
                </p>
                
                <p class="text-sm md:text-base text-slate-300 mb-6">
                    {{ hero.citation }}
                </p>
                
                <div class="inline-block bg-amber-400/20 border border-amber-400 rounded-lg px-6 py-3 backdrop-blur-sm">
                    <p class="text-amber-400 font-semibold text-lg">
                        {{ hero.date_label }}
                    </p>
                </div>
            </div>
        </div>

        <!-- TIMER -->
        <div class="timer-wrapper">
            <TimerEventPage/>
        </div>
    </section>
</template>

<style>

.section-hero {
    @apply relative flex flex-col items-center justify-center;
}

.hero-container {
    @apply relative w-full overflow-hidden;
    aspect-ratio: 16 / 9;
    max-height: 65vh;
}

@media (max-width: 768px) {
    .hero-container {
        aspect-ratio: 4 / 5;
        max-height: 55vh;
    }

    .hero-main {
        padding: 8px;
    }
}

.hero-layer {
    @apply absolute inset-0;
    transition: opacity 700ms ease-in-out;
}

.hero-layer.is-active {
    opacity: 1;
    z-index: 2;
}

.hero-layer.is-hidden {
    opacity: 0;
    z-index: 1;
}

.hero-bg {
    @apply absolute inset-0 w-full h-full object-cover;
    filter: blur(40px) brightness(0.4);
    transform: scale(1.1);
}

.hero-main {
    @apply absolute inset-0 w-full h-full object-contain;
    object-position: center;
}

@media (max-width: 768px) {
    .hero-main {
        padding: 12px;
    }
}

.nav-btn {
    @apply !absolute top-1/2 -translate-y-1/2 z-20 w-12 h-12;
}

.nav-btn.left {
    @apply !left-4;
}

.nav-btn.right {
    @apply !right-4;
}

.hero-content {
    @apply absolute inset-0 z-10 flex items-center justify-center px-4;
}

.timer-wrapper {
    @apply left-0 w-full px-4 z-30 my-10;
}

</style>