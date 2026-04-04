<script setup lang="ts">
import NavbarEvents from "@/pages/public/homeEvents/NavbarEvents.vue";
import EventGrid from "@/pages/public/homeEvents/EventGrid.vue";
import HeroSectionEvents from "@/pages/public/homeEvents/HeroSectionEvents.vue";
import CategoryNavEvents from "@/pages/public/homeEvents/CategoryNavEvents.vue";
import FiltersSidebarEvents from "@/pages/public/homeEvents/FiltersSidebarEvents.vue";

</script>

<template>
    <NavbarEvents/>

    <main class="pt-20">
        <HeroSectionEvents/>
        <CategoryNavEvents/>

        <section class="px-6 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">
            <FiltersSidebarEvents/>
            <EventGrid :activities="[]"/>
        </section>
    </main>
</template>