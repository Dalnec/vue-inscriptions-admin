<script setup lang="ts">

import { ref } from "vue";

const emit = defineEmits([ "update:search" ]);

const onInput = () => {
    emit("update:search");
};

const search = ref("");

defineExpose({ search });

</script>

<template>
    <nav class="navbar">
        <div class="navbar__container">

            <!-- LOGO -->
            <div class="navbar__left">
                <span class="navbar__logo">
                    Regis
                </span>
            </div>

            <!-- SEARCH -->
            <div class="navbar__center">
                <IconField>
                    <InputIcon>
                        <i-material-symbols-search-rounded/>
                    </InputIcon>
                    <InputText v-model="search" @update:modelValue="onInput()" fluid placeholder="Buscar eventos..." class="rounded-full"/>
                </IconField>
            </div>

            <!-- ACTIONS -->
            <div class="navbar__right">
            </div>
        </div>
    </nav>
</template>

<style scoped>

.navbar {
    @apply fixed top-0 w-full z-50 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60;
    @apply bg-white/80 dark:bg-slate-950/80;
}

.navbar__container {
    @apply max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3;
}

.navbar__left {
    @apply flex items-center;
}

.navbar__logo {
    @apply text-xl md:text-2xl font-extrabold italic tracking-tight;
    @apply text-red-700 dark:text-red-500;
}

.navbar__center {
    @apply flex-1 max-w-md mx-6;
}

.navbar__right {
    @apply flex items-center gap-2;
}

</style>