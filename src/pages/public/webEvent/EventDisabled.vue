<script setup lang="ts">
import { inject, computed, type Ref } from "vue";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const infoActivity = inject<Ref<InterfaceActivities>>("infoActivity");

const eventTitle = computed(() => infoActivity?.value?.title || "Este evento");
const eventLogo = computed(() => infoActivity?.value?.logo);
</script>

<template>
    <div class="min-h-screen flex items-center justify-center px-4 bg-event-bg">
        <div class="text-center max-w-md w-full">

            <div class="flex justify-center mb-6">
                <img v-if="eventLogo" :src="eventLogo" alt="Logo del evento" class="h-24 w-24 rounded-2xl object-cover shadow-lg border border-white/10" />
                <div v-else class="h-24 w-24 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <i-material-symbols-event-busy-outline-rounded class="text-4xl text-white/40" />
                </div>
            </div>

            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-xl">
                <div class="w-14 h-14 rounded-full bg-event-accent/15 flex items-center justify-center mx-auto mb-5">
                    <i-material-symbols-event-busy-outline-rounded class="text-2xl text-event-accent" />
                </div>

                <h1 class="text-2xl font-bold text-white mb-2">Evento no disponible</h1>

                <p class="text-white/60 text-sm leading-relaxed mb-6">
                    <span class="text-white font-semibold">{{ eventTitle }}</span> no se encuentra activo en este momento.
                    Puede que aún no haya iniciado o que ya haya finalizado.
                </p>

                <div class="flex flex-col gap-3">
                    <router-link :to="{ name: 'webHome' }">
                        <Button label="Ver otros eventos" class="w-full rounded-xl" outlined />
                    </router-link>
                </div>
            </div>

            <p class="mt-6 text-white/30 text-xs">
                Si crees que esto es un error, contacta al organizador del evento.
            </p>
        </div>
    </div>
</template>

