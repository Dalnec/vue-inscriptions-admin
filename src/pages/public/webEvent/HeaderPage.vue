<script setup lang="ts">
import router from "@/router";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const props = defineProps<{ infoActivity: InterfaceActivities }>();

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const w = globalThis as unknown as Window;
const route = useRoute();

const handleScroll = () => isScrolled.value = w.scrollY > 50;
const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value;

const menuItems = [
    { currentPage: "#about", label: "¿De qué se trata?" },
    { currentPage: "", label: "Agenda" },
    { currentPage: "#team", label: "Nuestro equipo" },
    { currentPage: "#location", label: "Ubicanos" }
];

const specialItem = { label: "Inscríbete" };

const onInscriptions = () => {
    // useGlobalToast({ life: 10000, severity: "warn", summary: "Las Inscripciones por este medio están inactivas" });
    router.push({ name: "event-inscription", params: { slug: route.params.slug } });
};

watch(isMobileMenuOpen, (val) => {
    document.body.style.overflow = val ? "hidden" : "";
});

onMounted(() => {
    w.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    w.removeEventListener("scroll", handleScroll);
});

</script>

<template>
    <header class="sticky top-0 z-50 transition-all duration-300"
            :class="isScrolled
                ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40' : 'bg-transparent'">
        <nav class="container mx-auto flex items-center justify-between py-3 px-4">

            <!-- Logo -->
            <router-link :to="`/${infoActivity.shortname}`" class="flex items-center gap-3">
                <img :src="infoActivity.logo ?? '../../../assets/images/kadosh.png'" class="h-12" alt=""/>
                <div class="hidden sm:flex flex-col">
                    <span class="text-white font-semibold text-lg">{{ infoActivity.shortname }}</span>
                    <span class="text-xs text-slate-400">Evento Cristiano</span>
                </div>
            </router-link>

            <!-- Mobile button -->
            <Button class="block md:hidden text-white" @click="toggleMobileMenu">
                <svg class="h-6 w-6" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            </Button>

            <!-- Desktop -->
            <ul class="hidden md:flex items-center gap-6">
                <li v-for="(item, index) in menuItems" :key="index">
                    <router-link :to="{ path:'/camp2026', hash: item.currentPage }" class="menu-items-effect">
                        {{ item.label }}
                    </router-link>
                </li>

                <Button @click="onInscriptions" :label="specialItem.label" class="px-5 py-2 rounded-xl"/>
            </ul>
        </nav>

        <transition name="fade">
            <div v-if="isMobileMenuOpen" class="fixed inset-0 z-40 md:hidden">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isMobileMenuOpen = false"/>
                <div class="relative z-50 flex justify-center mt-24 px-4">
                    <div class="w-full max-w-md rounded-2xl bg-slate-950/95 backdrop-blur-xl p-6 shadow-2xl border border-white/10">

                        <ul class="flex flex-col gap-4 text-center">
                            <li v-for="(item, index) in menuItems" :key="index">
                                <router-link :to="{ path:'/camp2026', hash: item.currentPage }"
                                             class="block text-slate-300 hover:text-white transition text-lg"
                                             @click="isMobileMenuOpen = false"> {{ item.label }}
                                </router-link>
                            </li>

                            <Button @click="onInscriptions" :label="specialItem.label" class="mt-4 rounded-xl font-semibold"/>
                        </ul>
                    </div>
                </div>
            </div>
        </transition>
    </header>
</template>

<style>

.menu-items-effect {
    @apply relative text-slate-300 hover:text-white text-base font-medium transition-colors duration-200
    after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-amber-400
    after:transition-all after:duration-300 hover:after:w-full;
}

</style>