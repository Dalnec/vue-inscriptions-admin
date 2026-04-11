<script setup lang="ts">
import CountDownEvent from "@/pages/public/webEvent/CountDownEvent.vue";
import { inject, computed, type Ref } from "vue";
import { format, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const infoActivity = inject<Ref<InterfaceActivities>>("infoActivity");

/** Parsea "yyyy-MM-dd HH:mm:ss" o ISO de forma segura */
const safeDate = (v: string | Date | null | undefined): Date | null => {
    if (!v) return null;
    if (v instanceof Date) return v;
    return new Date(v.replace(" ", "T"));
};

const dateRangeLabel = computed(() => {
    const s = safeDate(infoActivity?.value?.start_date);
    const e = safeDate(infoActivity?.value?.end_date);
    if (!s) return "";
    const startDay = format(s, "d", { locale: es });
    const endFormatted = e ? ` - ${ format(e, "d 'de' MMMM", { locale: es }) }` : ` de ${ format(s, "MMMM", { locale: es }) }`;
    return `${ startDay }${ endFormatted }`;
});

const timeLabel = computed(() => {
    const s = safeDate(infoActivity?.value?.start_date);
    if (!s) return "";
    return format(s, "h:mm a", { locale: es });
});

const locationLabel = computed(() => infoActivity?.value?.location_text || "");

/** Si start_date ya pasó, usar end_date para el countdown */
const countdownTarget = computed(() => {
    const now = new Date();
    const start = safeDate(infoActivity?.value?.start_date);
    const end = safeDate(infoActivity?.value?.end_date);
    if (start && !isBefore(start, now)) return start;
    if (end && !isBefore(end, now)) return end;
    return null;
});

const isEventOngoing = computed(() => {
    const now = new Date();
    const start = safeDate(infoActivity?.value?.start_date);
    const end = safeDate(infoActivity?.value?.end_date);
    return start && isBefore(start, now) && end && !isBefore(end, now);
});
</script>

<template>
    <div class="relative z-30">
        <div class="countdown-timer">
            <div class="flex flex-col gap-4 text-white">
                <div class="flex flex-row flex-wrap justify-between items-center gap-4 text-center md:text-left">

                    <div class="flex items-center gap-3" v-if="dateRangeLabel">
                        <i-material-symbols-calendar-month class="text-event-accent text-xl"/>
                        <span class="text-sm md:text-base font-medium">{{ dateRangeLabel }}</span>
                    </div>

                    <div class="flex items-center gap-3" v-if="timeLabel">
                        <i-tabler-clock-hour-5 class="text-event-accent text-xl"/>
                        <span class="text-sm md:text-base font-medium">{{ timeLabel }}</span>
                    </div>

                    <div class="flex items-center gap-3" v-if="locationLabel">
                        <i-material-symbols-file-map class="text-event-accent text-xl"/>
                        <span class="text-sm md:text-base font-medium">{{ locationLabel }}</span>
                    </div>
                </div>
                <div class="w-full h-px bg-white/10"></div>

                <!-- Indicador de evento en curso -->
                <p v-if="isEventOngoing" class="text-center text-event-accent text-sm font-medium tracking-wide uppercase">
                    🔴 Evento en curso — Finaliza en:
                </p>

                <CountDownEvent :target-date="countdownTarget"/>
            </div>
        </div>
    </div>
</template>

<style>

.countdown-timer {
    @apply mx-auto max-w-5xl bg-event-bg-dark/85 backdrop-blur-xl border border-white/10
    rounded-2xl shadow-2xl shadow-black/40 px-6 py-6 md:px-10 transform;
}

</style>