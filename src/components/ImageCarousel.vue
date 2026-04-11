<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

interface Props {
    images: string[];
    autoplayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    autoplayInterval: 5000,
    showControls: true,
    showIndicators: true
});

const currentImageIndex = ref(0);
let imageInterval: ReturnType<typeof setInterval> | null = null;

const hasMultipleImages = computed(() => props.images && props.images.length > 1);

const nextImage = () => {
    if (!props.images || props.images.length === 0) return;
    currentImageIndex.value = (currentImageIndex.value + 1) % props.images.length;
};

const prevImage = () => {
    if (!props.images || props.images.length === 0) return;
    currentImageIndex.value = (currentImageIndex.value - 1 + props.images.length) % props.images.length;
};

const goToImage = (index: number) => {
    currentImageIndex.value = index;
};

const startAutoplay = () => {
    stopAutoplay();
    imageInterval = setInterval(nextImage, props.autoplayInterval);
};

const stopAutoplay = () => {
    if (imageInterval) {
        clearInterval(imageInterval);
        imageInterval = null;
    }
};

onMounted(() => {
    if (hasMultipleImages.value) {
        startAutoplay();
    }
});

onUnmounted(() => {
    stopAutoplay();
});
</script>

<template>
    <div class="relative group"
         @mouseenter="stopAutoplay"
         @mouseleave="hasMultipleImages && startAutoplay()">
        <div class="absolute -inset-2 bg-event-accent/10 blur-2xl rounded-3xl"></div>

        <div class="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-[250px] md:h-[350px]">
            <!-- IMAGENES -->
            <div v-if="images && images.length > 0" class="relative h-full">
                <div v-for="(img, index) in images" 
                     :key="index"
                     :class="[
                         'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                         index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                     ]">
                    <img :src="img" alt="" class="w-full h-full object-cover"/>
                </div>

                <!-- NAVEGACION - ANTERIOR -->
                <button v-if="showControls && hasMultipleImages"
                        @click="prevImage"
                        class="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Imagen anterior">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>

                <!-- NAVEGACION - SIGUIENTE -->
                <button v-if="showControls && hasMultipleImages"
                        @click="nextImage"
                        class="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Siguiente imagen">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>

                <!-- INDICADORES -->
                <div v-if="showIndicators && hasMultipleImages" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                    <button v-for="index in images.length"
                            :key="index"
                            @click="goToImage(index - 1)"
                            :class="[
                                'w-2 h-2 rounded-full transition-all duration-300',
                                index - 1 === currentImageIndex ? 'bg-event-accent w-8' : 'bg-white/40 hover:bg-white/60'
                            ]"
                            :aria-label="`Ir a imagen ${index}`"/>
                </div>
            </div>

            <!-- FALLBACK -->
            <div v-else class="w-full h-full text-center flex items-center justify-center bg-event-bg-dark">
                <p class="text-white/40">No hay imágenes disponibles</p>
            </div>
        </div>
    </div>
</template>

