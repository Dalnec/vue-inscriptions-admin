<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const classContent = "h-72 flex flex-col cursor-pointer items-center justify-center w-72 rounded-xl border border-[#dadaea] dark:border-[#474751] hover:shadow-lg dark:hover:shadow-surface-700";

</script>

<template>
    <Card>
        <template #title>
            <p>Configuración</p>
        </template>
        <template #content>
            <div class="flex flex-wrap items-center justify-center gap-2">
                <div :class="classContent" @click="router.push({ name: 'event', force: true })">
                    <i-material-symbols-date-range class="text-9xl text-surface-900 dark:text-white"/>
                    <p class="text-xl font-semibold dark:text-white">Evento</p>
                </div>
                <div :class="classContent" @click="router.push({ name: 'concepts', force: true })">
                    <i-icon-park-outline-concept-sharing class="text-9xl text-surface-900 dark:text-white"/>
                    <p class="text-xl font-semibold text-surface-900 dark:text-white">Conceptos</p>
                </div>
            </div>
        </template>
    </Card>
</template>
