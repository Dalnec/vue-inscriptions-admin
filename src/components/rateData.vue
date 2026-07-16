<script setup lang="ts">

import { computed } from "vue";

interface RateSelectedPayload {
	idRate: number;
	priceRate: string;
	nameRate: string;
}

const emit = defineEmits<{
	(event: "on-rate-selected", payload: RateSelectedPayload): void
}>();

const props = defineProps({
	idRate: { required: false, type: Number, default: 0 },
	idRateSelected: { required: false, type: Number, default: 0 },
	priceRate: { required: true, type: String, default: "" },
	nameRate: { required: true, type: String, default: "" }
});

const isSelected = computed(() => props.idRate === props.idRateSelected);

function rateClicked() {
	emit("on-rate-selected", {
		idRate: props.idRate,
		priceRate: props.priceRate,
		nameRate: props.nameRate
	});
}

</script>

<template>
	<div @click="rateClicked"
	     class="rate-card group relative col-span-2 cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 sm:col-span-1"
	     :class="isSelected
             ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-200 dark:border-primary-400 dark:bg-primary-950/40 dark:ring-primary-800'
             : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'">

		<div class="flex flex-col items-center gap-1 text-center">
            <span class="text-xs font-semibold uppercase tracking-wider"
                  :class="isSelected
                      ? 'text-primary-600 dark:text-primary-300'
                      : 'text-surface-400 dark:text-surface-500'">
                {{ props.nameRate }}
            </span>
			<span class="text-2xl font-bold leading-tight"
			      :class="isSelected
                      ? 'text-primary-700 dark:text-primary-200'
                      : 'text-surface-800 dark:text-surface-100'">
                S/ {{ props.priceRate }}
            </span>
		</div>

		<div v-if="isSelected"
		     class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm dark:bg-primary-400">
			<i-material-symbols-check-rounded class="text-sm"/>
		</div>
	</div>
</template>
