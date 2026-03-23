<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import TimerEventPage from "@/pages/public/TimerEventPage.vue";

const images = ref<string[]>([]);
const currentIndex = ref(0);

let interval: ReturnType<typeof setInterval> | null = null;

const nextImage = () => {
    const next = (currentIndex.value + 1) % images.value.length;
    changeImage(next);
};

const prevImage = () => {
    const prev =
        (currentIndex.value - 1 + images.value.length) % images.value.length;
    changeImage(prev);
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

const preloadImages = async(src: string[]) => {
    await Promise.all(src.map((src) => new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
    })));
};

const changeImage = (newIndex: number) => {
    if ( !images.value.length) return;
    currentIndex.value = newIndex;
};

onMounted(async() => {
    const modules = import.meta.glob("@/assets/images/*.{png,jpg,jpeg,webp}", { eager: true });

    const loaded = Object.values(modules).map((mod: any) => mod.default);
    await preloadImages(loaded);
    images.value = loaded;
    startAutoplay();
});

onUnmounted(() => stopAutoplay());

</script>

<template>
    <section class="section-hero" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
        <div class="hero-bg">
            <div class="relative w-full h-full overflow-hidden">
                <img v-for="(img, index) in images" :key="index" :src="img" :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"
                     alt="" class="hero-image absolute inset-0 transition-opacity duration-700 ease-in-out"/>
            </div>

            <div class="hero-overlay"></div>
        </div>
        <Button @click="prevImage" rounded class="!absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12" #icon>
            <i-material-symbols-arrow-back-ios-new-rounded class="text-lg"/>
        </Button>

        <Button @click="nextImage" rounded class="!absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12" #icon>
            <i-material-symbols-arrow-forward-ios-rounded class="text-lg"/>
        </Button>
        <div class="absolute bottom-0 left-0 w-full translate-y-1/2 z-20 px-4">
            <TimerEventPage />
        </div>
    </section>
</template>

<style>

.section-hero {
    @apply relative flex min-h-[90vh] items-center justify-center overflow-visible;
}

.hero-bg {
    @apply absolute inset-0 z-0;
}

.hero-image {
    @apply h-full w-full object-cover;
    backface-visibility: hidden;
    transform: translateZ(0);
}

.dark .hero-image {
    filter: brightness(0.9);
}

.hero-overlay {
    @apply absolute inset-0;
    background: linear-gradient(
        to bottom,
        rgba(2, 6, 23, 0.3) 0%,
        rgba(2, 6, 23, 0.7) 60%,
        rgba(2, 6, 23, 0.95) 100%
    );
}

.dark .hero-overlay {
    background: linear-gradient(to top, var(--color-hero-overlay-dark), transparent);
}

</style>