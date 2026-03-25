<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

import concilio1 from "@/assets/images/concilio1.jpg";
import concilio2 from "@/assets/images/concilio2.jpg";
import concilio3 from "@/assets/images/presidents.jpg";

const team = [
    { name: "Equipo Kadosh", image: concilio1 },
    { name: "Liderazgo Espiritual", image: concilio2 },
    { name: "Equipo Organizador", image: concilio3 }
];

const currentIndex = ref(0);
const prevIndex = ref(0);

let interval: ReturnType<typeof setInterval>;

const next = () => {
    prevIndex.value = currentIndex.value;
    currentIndex.value = (currentIndex.value + 1) % team.length;
};

const prev = () => {
    prevIndex.value = currentIndex.value;
    currentIndex.value = (currentIndex.value - 1 + team.length) % team.length;
};

onMounted(() => interval = setInterval(next, 4000));
onUnmounted(() => clearInterval(interval));

</script>

<template>
    <section class="bg-slate-950 py-16 px-4">

        <div class="max-w-6xl mx-auto">

            <!-- HEADER -->
            <div class="text-center max-w-3xl mx-auto mb-10">
                <h2 class="text-3xl md:text-5xl text-white"> Conoce a nuestro equipo </h2>

                <p class="mt-6 text-slate-400 text-lg leading-relaxed">
                    Personas comprometidas con un mismo propósito:
                    <span class="text-amber-400 font-semibold"> guiarte a una experiencia real con Dios </span>
                </p>
            </div>

            <div class="relative">
                <div class="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <div class="relative h-[400px] md:h-[500px]">

                        <!-- fondo -->
                        <img :src="team[currentIndex].image" class="absolute inset-0 w-full h-full object-cover slider-bg" alt=""/>
                        <!-- principal -->
                        <img :src="team[currentIndex].image" class="absolute inset-0 w-full h-full object-contain slider-main" alt=""/>
                    </div>

                    <Button @click="prev" rounded class="nav-btn left" #icon>
                        <i-material-symbols-arrow-back-ios-new-rounded/>
                    </Button>

                    <Button @click="next" rounded class="nav-btn right" #icon>
                        <i-material-symbols-arrow-forward-ios-rounded/>
                    </Button>
                </div>

                <div class="mt-6 text-center px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 class="text-xl md:text-2xl text-white font-semibold"> {{ team[currentIndex].name }} </h3>

                    <p class="text-slate-400 mt-2 text-sm md:text-base max-w-2xl mx-auto">
                        Un equipo dispuesto a servir, guiar y acompañarte en cada momento del evento.
                    </p>
                </div>

                <!-- dots -->
                <div class="flex justify-center gap-2 mt-4">
                    <span v-for="(item, index) in team" :key="item.name" class="h-2 rounded-full transition-all"
                          :class="index === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/30'"/>
                </div>
            </div>
        </div>
    </section>
</template>

<style>

.slider-bg {
    filter: blur(10px) brightness(0.4);
    transform: scale(1.18);
}

.slider-main {
    transition: opacity 400ms ease;
}

/* botones */
.nav-btn {
    @apply !absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10;
}

.nav-btn.left {
    @apply !left-4;
}

.nav-btn.right {
    @apply !right-4;
}

</style>