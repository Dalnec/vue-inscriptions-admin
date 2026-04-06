<script setup lang="ts">
import { ref } from "vue";
import { formatDateToString } from "@/composables/convertDates.ts";

const props = defineProps<{
    clearFilters: () => void;
}>();

const emit = defineEmits([ "update:modelValue" ]);

const localFilters = ref({
    location: "",
    start_date_range_after: null,
    start_date_range_before: null
});

const emitFilters = () => {
    emit("update:modelValue", {
        location: localFilters.value.location,
        start_date_range_after: localFilters.value.start_date_range_after ? formatDateToString(localFilters.value.start_date_range_after) : null,
        start_date_range_before: localFilters.value.start_date_range_before ? formatDateToString(localFilters.value.start_date_range_before) : null
    });
};

const clearFilters = () => {
    localFilters.value.start_date_range_after = null;
    localFilters.value.start_date_range_before = null;
    localFilters.value.location = "";
    emitFilters();
    props.clearFilters();
};

defineExpose({ localFilters });

</script>
<template>
    <aside class="filters-sidebar">
        <div class="filters-card">

            <h3 class="filters-title">Filtros</h3>

            <!-- FECHA -->
            <div class="filters-group">
                <label class="filters-label">Fecha inicio</label>
                <DatePicker v-model="localFilters.start_date_range_after" @date-select="emitFilters"/>
            </div>

            <div class="filters-group"><label class="filters-label">Fecha fin</label>
                <DatePicker v-model="localFilters.start_date_range_before" @date-select="emitFilters"/>
            </div>

            <!-- UBICACIÓN -->
            <div class="filters-group">
                <label class="filters-label">Ubicación</label>
                <InputText v-model="localFilters.location" placeholder="Ej: Lima" @update:modelValue="emitFilters"/>
            </div>

            <!-- ACTION -->
            <button @click="clearFilters" class="filters-clear">
                Limpiar filtros
            </button>
        </div>
    </aside>
</template>

<style scoped>

.filters-sidebar {
    @apply lg:col-span-1;
}

.filters-card {
    @apply p-6 rounded-2xl space-y-6 border transition-all duration-300;

    /* LIGHT */
    @apply bg-white border-slate-200 shadow-sm;

    /* DARK (moderno, no opaco) */
    @apply dark:bg-slate-900/70 dark:border-slate-800;
    @apply dark:backdrop-blur-xl;
}

.filters-title {
    @apply text-lg font-semibold tracking-tight;

    @apply text-slate-900;
    @apply dark:text-slate-100;
}

.filters-group {
    @apply flex flex-col gap-2;
}

.filters-label {
    @apply text-xs font-semibold uppercase tracking-wide;

    @apply text-slate-500;
    @apply dark:text-slate-400;
}

.filters-clear {
    @apply w-full py-2.5 rounded-lg text-sm font-semibold transition-all;
    @apply border border-slate-300 text-slate-700 hover:bg-slate-100;
    @apply dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800;
}

</style>