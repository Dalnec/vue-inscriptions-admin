<script setup lang="ts">
import EventCard from "./EventCard.vue";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

defineProps<{ activities: InterfaceActivities[]; }>();

interface ActivityCardModel {
    category: string;
    date: string;
    id: number | null;
    image: string;
    location: string;
    title: string;
}

const mapActivityToCard = (activity: InterfaceActivities): ActivityCardModel => {
    return {
        id: activity.id ?? null,
        title: activity.title,
        location: activity.location,

        // formateo de fecha
        date: activity.start_date
              ? new Date(activity.start_date).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
              : "Sin fecha",

        // fallback (no existe en backend aún)
        category: "Evento",

        // fallback (no existe en backend aún)
        image: "https://via.placeholder.com/400x300"
    };
};

</script>

<template>
    <div class="lg:col-span-3">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <EventCard v-for="event in activities.map(mapActivityToCard)" :key="event.id" :event="event"/>
        </div>
    </div>
</template>