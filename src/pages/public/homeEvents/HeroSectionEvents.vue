<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

import heroPlaceholder from "@/assets/kadoshImg/527572564_18067042124135800_8950310577576066691_n.jpg";

const props = defineProps<{
    activities: InterfaceActivities[];
}>();

const router = useRouter();

const featuredActivity = computed<InterfaceActivities | null>(() => {
    if ( !props.activities.length) return null;

    const now = Date.now();

    // Actividades activas cuya fecha de inicio es futura o en curso
    const upcoming = props.activities.filter(a => a.is_active && a.start_date).sort((a, b) => {
        const diffA = Math.abs(new Date(a.start_date!).getTime() - now);
        const diffB = Math.abs(new Date(b.start_date!).getTime() - now);
        return diffA - diffB;
    });

    return upcoming[0] || props.activities[0];
});

const heroTitle = computed(() => featuredActivity.value?.title || "Próximo Evento");
const heroDescription = computed(() => featuredActivity.value?.description || "Descubre los próximos eventos y sé parte de algo increíble.");
const heroImage = computed(() => featuredActivity.value?.logo || heroPlaceholder);

const heroDate = computed(() => {
    const act = featuredActivity.value;
    if ( !act?.start_date) return "";
    const s = new Date(act.start_date);
    return format(s, "d 'de' MMMM, yyyy", { locale: es });
});

const heroLocation = computed(() => featuredActivity.value?.location_text || "");

const goToEvent = () => {
    if (featuredActivity.value?.shortname) {
        router.push(`/${ featuredActivity.value.shortname }`);
    }
};
</script>

<template>
    <section class="px-6 max-w-screen-2xl mx-auto">
        <div class="relative h-[420px] md:h-[520px] w-full rounded-3xl overflow-hidden shadow-xl">

            <!-- Imagen -->
            <img class="absolute inset-0 w-full h-full object-cover" alt="Hero" :src="heroImage"/>
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"/>

            <!-- Contenido -->
            <div class="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-2xl">

                <!-- Badge -->
                <span class="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase bg-red-600 text-white px-3 py-1 rounded-full w-fit">
                    <i-material-symbols-star-rounded class="text-sm"/>
                    Destacado
                </span>

                <!-- Title -->
                <h1 class="text-white text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
                    {{ heroTitle }}
                </h1>

                <!-- Description -->
                <p class="text-gray-200 text-sm md:text-base lg:text-lg mb-4 line-clamp-3">
                    {{ heroDescription }}
                </p>

                <!-- Meta info -->
                <div class="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-300" v-if="heroDate || heroLocation">
                    <span v-if="heroDate" class="inline-flex items-center gap-1.5">
                        <i-material-symbols-calendar-month-outline-rounded class="text-red-400"/>
                        {{ heroDate }}
                    </span>
                    <span v-if="heroLocation" class="inline-flex items-center gap-1.5">
                        <i-material-symbols-location-on-outline-rounded class="text-red-400"/>
                        {{ heroLocation }}
                    </span>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-3" v-if="featuredActivity?.shortname">
                    <Button label="Ver evento" severity="danger" size="large" class="!px-6 !py-3" @click="goToEvent"/>
                </div>
            </div>
        </div>
    </section>
</template>