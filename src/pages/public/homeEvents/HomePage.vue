<script setup lang="ts">
import { axiosInstance } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import NavbarEvents from "@/pages/public/homeEvents/NavbarEvents.vue";
import EventGrid from "@/pages/public/homeEvents/EventGrid.vue";
import HeroSectionEvents from "@/pages/public/homeEvents/HeroSectionEvents.vue";
import CategoryNavEvents from "@/pages/public/homeEvents/CategoryNavEvents.vue";
import FiltersSidebarEvents from "@/pages/public/homeEvents/FiltersSidebarEvents.vue";
import type { TagInterface } from "@/types/TagInterface.ts";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const refHeader = ref();
const refFilterSidebar = ref();

const filters = ref({
	tags: ""
});

const tagOptions = ref<TagInterface[]>([]);
const allActivities = ref<InterfaceActivities[]>([]);

const onGetAllTAg = async() => {
	const response = await axiosInstance.get("/api/tag/");
	if (response && response.status === 200) {
		tagOptions.value = response.data;
	}
};

const onGetAllActivities = async() => {
	const response = await axiosInstance.get<InterfaceActivities[]>(
		"/api/activity/",
		{
			...filters.value,
			...refFilterSidebar.value.localFilters,
			search: refHeader.value.search

		});

	if (response?.status === 200) {
		allActivities.value = response.data;
	}
};

const onClearFilters = () => {
	filters.value = {
		tags: ""
	};
	onGetAllActivities();
};

onMounted(async() => {
	await onGetAllActivities();
	await onGetAllTAg();
});

</script>

<template>
	<NavbarEvents ref="refHeader" @update:search="onGetAllActivities()"/>

	<main class="pt-20 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
		<HeroSectionEvents :activities="allActivities"/>
		<CategoryNavEvents :categories="tagOptions" v-model="filters.tags" @update:modelValue="onGetAllActivities"/>
		<section class="events-layout">
			<FiltersSidebarEvents ref="refFilterSidebar" :modelValue="filters" :clear-filters="onClearFilters"
			                      @update:modelValue="onGetAllActivities"/>
			<EventGrid :activities="allActivities"/>
		</section>
	</main>
</template>

<style>

.events-layout {
	@apply px-6 max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10;
	@apply text-slate-800 dark:text-slate-100;
}

</style>