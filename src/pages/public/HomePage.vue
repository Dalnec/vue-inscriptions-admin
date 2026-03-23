<script setup lang="ts">

import HeaderPage from "@/pages/public/HeaderPage.vue";
import HeroSection from "@/pages/public/HeroSection.vue";
import AboutEvent from "@/pages/public/AboutEvent.vue";
import LocationEvent from "@/pages/public/LocationEvent.vue";
import TeamMembersEvent from "@/pages/public/TeamMembersEvent.vue";
import FooterPage from "@/pages/public/FooterPage.vue";

</script>

<template>
    <main class="bg-slate-900 text-white">
        <HeaderPage v-reveal/>
        <HeroSection v-reveal/>
        <AboutEvent v-reveal/>
        <LocationEvent v-reveal/>

        <div class="max-w-4xl mx-auto text-center bg-slate-900 py-16 px-4" v-reveal>
            <div class="w-32 h-1 bg-amber-400 mx-auto mb-6 rounded-full"></div>

            <h2 class="text-3xl md:text-5xl font-info text-white leading-tight">
                KADOSH
                <span class="block text-amber-400 mt-2"> “Llamados a Santidad” </span>
            </h2>

            <p class="mt-6 text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                Un llamado a vivir apartados, con propósito y entrega total a Dios.
            </p>
        </div>
        <TeamMembersEvent v-reveal/>
        <FooterPage/>
    </main>
</template>
