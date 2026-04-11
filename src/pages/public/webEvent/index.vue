<script setup lang="ts">

import HeroSection from "@/pages/public/webEvent/HeroSection.vue";
import AboutEvent from "@/pages/public/webEvent/AboutEvent.vue";
import PricingSection from "@/pages/public/webEvent/PricingSection.vue";
import LocationEvent from "@/pages/public/webEvent/LocationEvent.vue";
import TeamMembersEvent from "@/pages/public/webEvent/TeamMembersEvent.vue";
import FooterPage from "@/pages/public/webEvent/FooterPage.vue";
import TimerEventPage from "@/pages/public/webEvent/TimerEventPage.vue";

</script>

<template>
    <main class="bg-event-bg text-white">
        <HeroSection v-reveal/>
        <div class="left-0 w-full px-4 z-30 my-10">
            <TimerEventPage/>
        </div>
        <AboutEvent v-reveal/>
        <PricingSection v-reveal/>
        <LocationEvent v-reveal/>

        <div class="max-w-4xl mx-auto text-center bg-event-bg py-16 px-4" v-reveal>
            <div class="w-32 h-1 bg-event-accent mx-auto mb-6 rounded-full"></div>

            <h2 class="text-3xl md:text-5xl font-info text-white leading-tight">
                KADOSH
                <span class="block text-event-accent mt-2"> "Llamados a Santidad" </span>
            </h2>

            <p class="mt-6 text-white/60 text-sm md:text-base max-w-2xl mx-auto">
                Un llamado a vivir apartados, con propósito y entrega total a Dios.
            </p>
        </div>
        <TeamMembersEvent v-reveal/>
        <FooterPage/>
    </main>
</template>
