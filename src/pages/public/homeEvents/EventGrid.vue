<script setup lang="ts">
import EventCard from "./EventCard.vue";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

defineProps<{ activities: InterfaceActivities[] }>();

</script>

<template>
    <section class="event-grid-container">
        <div class="event-grid-header">
            <h2 class="event-grid-title">Eventos disponibles</h2>
        </div>

        <div v-if="!activities.length" class="event-grid-empty">
            <i-material-symbols-event-busy-rounded class="event-grid-empty__icon"/>
            <p class="event-grid-empty__title">No se encontraron eventos</p>
            <span class="event-grid-empty__subtitle">
                Intenta ajustar los filtros o realizar otra búsqueda
            </span>
        </div>

        <!-- GRID -->
        <div v-else class="event-grid">
            <EventCard v-for="event in activities" :key="event.id!" :event="event"/>
        </div>
    </section>
</template>

<style scoped>

.event-grid-container {
    @apply lg:col-span-3 space-y-6;
}

.event-grid-header {
    @apply flex items-center justify-between;
}

.event-grid-title {
    @apply text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight;
}

.event-grid {
    @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6;
}

.event-grid-empty {
    @apply flex flex-col items-center justify-center text-center;
    @apply py-16 px-6 rounded-2xl border;
    @apply bg-white border-slate-200;
    @apply dark:bg-slate-900/60 dark:border-slate-800;
    @apply dark:backdrop-blur-xl;
}

.event-grid-empty__icon {
    @apply text-5xl mb-4;
    @apply text-slate-400 dark:text-slate-500;
}

.event-grid-empty__title {
    @apply text-lg font-semibold;
    @apply text-slate-800 dark:text-slate-100;
}

.event-grid-empty__subtitle {
    @apply text-sm mt-1;
    @apply text-slate-500 dark:text-slate-400;
}
</style>