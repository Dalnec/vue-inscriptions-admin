<script setup lang="ts">

import CountDownEvent from "@/pages/public/CountDownEvent.vue";
</script>

<template>
    <div class="relative z-30 px-4">
        <div class="countdown-timer">
            <div class="flex flex-col gap-6 text-white">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">

                    <div class="flex items-center gap-3">
                        <i-material-symbols-calendar-month class="text-amber-400 text-xl"/>
                        <span class="text-sm md:text-base font-medium">25 - 29 de Julio</span>
                    </div>

                    <div class="flex items-center gap-3">
                        <i-tabler-clock-hour-5 class="text-amber-400 text-xl"/>
                        <span class="text-sm md:text-base font-medium">7:00 PM</span>
                    </div>

                    <div class="flex items-center gap-3">
                        <i-material-symbols-file-map class="text-amber-400 text-xl"/>
                        <span class="text-sm md:text-base font-medium">Lamas</span>
                    </div>
                </div>
                <div class="w-full h-px bg-white/10"></div>
                <CountDownEvent/>
            </div>
        </div>
    </div>
</template>

<style>

.countdown-timer {
    @apply mx-auto max-w-5xl bg-slate-950/85 backdrop-blur-xl border border-white/10
    rounded-2xl shadow-2xl shadow-black/40 px-6 py-6 md:px-10 transform;
}

</style>