<script setup lang="ts">
import { computed } from "vue";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";
import router from "@/router";

const props = defineProps<{ event: InterfaceActivities }>();

const formattedDate = computed(() => {
    if ( !props.event.start_date) return "Sin fecha";

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(props.event.start_date));
});

const image = computed(() => {
    return `https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800`;
});

const onRedirectEvent =async () => {
    await router.push({ name: "webPage", params: { slug: props.event.shortname } });
};

</script>

<template>
    <article class="event-card">
        <!-- IMAGE -->
        <div class="event-card__image-wrapper">
            <img :src="image" class="event-card__image" alt="event"/>

            <div class="event-card__overlay"/>

            <span v-if="event.is_active" class="event-card__badge">
                Activo
            </span>
        </div>

        <!-- CONTENT -->
        <div class="event-card__content">

            <span class="event-card__date">
                {{ formattedDate }}
            </span>

            <h3 class="event-card__title">
                {{ event.title }}
            </h3>

            <p class="event-card__description">
                {{ event.description }}
            </p>

            <div class="event-card__location">
                <i-material-symbols-location-on-rounded/>
                <span>{{ event.location }}</span>
            </div>

            <button class="event-card__button" @click="onRedirectEvent">
                Ver evento
            </button>
        </div>
    </article>
</template>

<style scoped>

.event-card {
    @apply flex flex-col overflow-hidden rounded-2xl
    border border-slate-200 dark:border-slate-800/60
    bg-white dark:bg-slate-900/80 backdrop-blur-sm
    transition-all duration-300  hover:shadow-xl
    hover:shadow-black/10 dark:hover:shadow-black/40 hover:-translate-y-1;
}

.event-card__image-wrapper {
    @apply relative h-52 overflow-hidden;
}

.event-card__image {
    @apply w-full h-full object-cover transition-transform duration-500;
}

.event-card:hover .event-card__image {
    @apply scale-105;
}

.event-card__overlay {
    @apply absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent;
}

.event-card__badge {
    @apply absolute top-3 left-3
    bg-emerald-500/90 text-white
    text-[10px] px-2 py-1 rounded-md
    font-semibold uppercase tracking-wide
    backdrop-blur;
}

.event-card__content {
    @apply flex flex-col p-5 flex-1;
}

.event-card__date {
    @apply text-xs font-semibold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wide;
}

.event-card__title {
    @apply text-lg font-semibold text-slate-900 dark:text-slate-100;
}

.event-card__description {
    @apply text-sm text-slate-600 dark:text-slate-400 my-2 line-clamp-2;
}

.event-card__location {
    @apply flex items-center gap-2 text-sm
    text-slate-500 dark:text-slate-400 mb-4;
}

.event-card__button {
    @apply mt-auto w-full rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200;
    @apply bg-red-600 text-white hover:bg-red-700;
    @apply dark:bg-red-500 dark:hover:bg-red-600;
    @apply active:scale-[0.98];
}

</style>