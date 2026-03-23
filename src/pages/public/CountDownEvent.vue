<script setup lang="ts"> import { ref, onMounted, onUnmounted } from "vue";
import { intervalToDuration, isBefore } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

const countdown = ref({ days: 0, hours: 0, minutes: 0, months: 0, seconds: 0 });
const limaTimeZone = "America/Lima";
const targetDateString = "2026-07-25T19:00:00";
const targetDateUTC = fromZonedTime(new Date(targetDateString), limaTimeZone);
let interval: ReturnType<typeof setInterval>;

const updateCountdown = () => {
    const now = new Date();

    if (isBefore(targetDateUTC, now)) {
        countdown.value = { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        clearInterval(interval);
        return;
    }

    const duration = intervalToDuration({
        start: now,
        end: targetDateUTC
    });

    countdown.value = {
        days: duration.days || 0,
        hours: duration.hours || 0,
        minutes: duration.minutes || 0,
        months: duration.months || 0,
        seconds: duration.seconds || 0
    };
};

onMounted(() => {
    updateCountdown();
    interval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
    clearInterval(interval);
});

</script>

<template>
    <div class="flex items-center justify-center gap-3 md:gap-6 text-white">

        <div class="time-box" v-if="countdown.months">
            <span>{{ countdown.months }}</span>
            <small>Meses</small>
        </div>

        <div class="time-box" v-if="countdown.days">
            <span>{{ countdown.days }}</span>
            <small>Días</small>
        </div>

        <div class="time-box" v-if="countdown.hours">
            <span>{{ countdown.hours }}</span>
            <small>Horas</small>
        </div>

        <div class="time-box">
            <span>{{ countdown.minutes }}</span>
            <small>Min</small>
        </div>

        <div class="time-box">
            <span>{{ countdown.seconds }}</span>
            <small>Seg</small>
        </div>

    </div>
</template>

<style scoped>

.time-box {
    @apply flex flex-col items-center justify-center
    w-16 h-16 md:w-20 md:h-20
    rounded-xl bg-white/5 backdrop-blur-md
    border border-white/10;
}

.time-box span {
    @apply text-lg md:text-2xl font-bold;
}

.time-box small {
    @apply text-[10px] md:text-xs text-slate-400 uppercase;
}
</style>