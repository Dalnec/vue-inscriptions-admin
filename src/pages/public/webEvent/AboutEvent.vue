<script setup lang="ts">
import pageConfig from "@/assets/page_config.json";
import ImageCarousel from "@/components/ImageCarousel.vue";
import { onMounted, ref } from "vue";

const { vision_section } = pageConfig;
const images = ref<string[]>([]);

onMounted(() => {
    const modules = import.meta.glob("@/assets/KadoshSlider/*.{png,jpg,jpeg,webp}", { eager: true });
    images.value = Object.values(modules).map((mod: any) => mod.default);
})

</script>

<template>
    <div class="mx-auto max-w-6xl px-4 md:px-0">
        <!-- HEADER -->
        <div class="text-center md:text-left px-2 md:px-0">
            <h2 class="text-3xl md:text-5xl font-info text-white leading-tight">
                {{ vision_section.title }}
                <span class="text-event-accent block mt-2">transformará tu vida</span>
            </h2>

            <p class="mt-6 text-lg md:text-xl text-white/70 leading-relaxed">
                {{ vision_section.description }}
            </p>
        </div>

        <!-- CONTENT -->
        <div class="mt-16 grid md:grid-cols-2 gap-8 md:gap-10 items-center">

            <!-- SLIDER DE IMAGENES -->
            <ImageCarousel v-if="vision_section.images && vision_section.images.length > 0" :images="images"
                           :autoplay-interval="3000" :show-controls="true" :show-indicators="true"/>

            <!-- TEXTO -->
            <div class="text-center md:text-left">

                <h3 class="text-2xl md:text-4xl font-info text-white">
                    Vive la experiencia
                </h3>

                <p class="mt-6 text-white/70 text-lg leading-relaxed">
                    Descubre el propósito que Dios tiene para ti mientras desarrollas los dones y talentos
                    que Él ha puesto en tu vida.
                </p>

                <p class="mt-4 text-white/50 text-base">
                    Este no es solo un evento, es un llamado a vivir una vida apartada, consagrada y con impacto.
                </p>
            </div>
        </div>
    </div>
</template>
