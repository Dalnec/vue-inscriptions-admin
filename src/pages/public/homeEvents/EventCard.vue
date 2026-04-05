<script setup lang="ts">

import type { ActivityCardModel } from "@/types/interfaceActivities.ts";

defineProps<{ event: ActivityCardModel; }>();

</script>

<template>
    <article class="group bg-surface-container-lowest rounded-full overflow-hidden flex flex-col hover:shadow-2xl transition-all">
        <div class="relative h-64 overflow-hidden">
            <img :src="event.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt=""/>

            <div class="absolute top-4 left-4">
                <span class="bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase">
                    {{ event.category }}
                </span>
            </div>
        </div>

        <div class="p-6 flex-1 flex flex-col">
            <span class="text-[11px] font-bold text-primary mb-1 uppercase">
                {{ event.date }}
            </span>

            <h3 class="font-headline font-bold text-xl mb-2">
                {{ event.title }}
            </h3>

            <div class="flex items-center gap-2 text-tertiary mb-6">
                <span class="material-symbols-outlined text-sm">location_on</span>
                <span class="text-xs">{{ event.location }}</span>
            </div>

            <button class="mt-auto kinetic-gradient text-white px-4 py-2 rounded-lg text-[10px] font-bold">
                VER EVENTO
            </button>
        </div>
    </article>
</template>