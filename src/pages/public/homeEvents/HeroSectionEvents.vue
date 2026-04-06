<script setup lang="ts">
import Button from "primevue/button";

defineProps<{
    title?: string;
    subtitle?: string;
    image?: string;
}>();

</script>

<template>
    <section class="px-6 max-w-screen-2xl mx-auto">
        <div class="relative h-[520px] w-full rounded-3xl overflow-hidden shadow-xl">

            <!-- Imagen -->
            <img class="absolute inset-0 w-full h-full object-cover" alt="Hero" :src="image || 'https://placehold.co/600x400'"/>
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"/>

            <!-- Contenido -->
            <div class="relative z-10 flex flex-col justify-center h-full px-10 md:px-16 max-w-2xl">

                <!-- Badge -->
                <span class="mb-4 inline-block text-xs font-semibold tracking-widest uppercase bg-red-600 text-white px-3 py-1 rounded-full w-fit">
                    Destacado
                </span>

                <!-- Title -->
                <h1 class="text-white text-4xl md:text-6xl font-bold leading-tight mb-4">
                    {{ title || "Retiro Juvenil 2024" }}
                </h1>

                <!-- Subtitle -->
                <p class="text-gray-200 text-base md:text-lg mb-8">
                    {{ subtitle || "Vive una experiencia transformadora con música, comunidad y crecimiento personal." }}
                </p>

                <!-- Actions -->
                <div class="flex flex-wrap gap-4">
                    <Button label="Inscribirse" severity="danger" size="large" class="!px-6 !py-3"/>
                    <Button label="Ver detalles" outlined severity="secondary" size="large"
                            class="!px-6 !py-3 !text-white !border-white hover:!bg-white/10"/>
                </div>
            </div>
        </div>
    </section>
</template>