<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import HeaderPage from "@/pages/public/webEvent/HeaderPage.vue";
import HeroSection from "@/pages/public/webEvent/HeroSection.vue";
import AboutEvent from "@/pages/public/webEvent/AboutEvent.vue";
import PricingSection from "@/pages/public/webEvent/PricingSection.vue";
import LocationEvent from "@/pages/public/webEvent/LocationEvent.vue";
import TeamMembersEvent from "@/pages/public/webEvent/TeamMembersEvent.vue";
import FooterPage from "@/pages/public/webEvent/FooterPage.vue";
import TimerEventPage from "@/pages/public/webEvent/TimerEventPage.vue";
import type { InterfaceActivities, InterfaceResponseActivities } from "@/types/interfaceActivities.ts";

const route = useRoute();
const infoActivity = ref<InterfaceActivities>({
    created: null, description: "", end_date: null, is_active: false, location: { lat: null, lng: null },
    location_text: "", logo: "", modified: null, settings: {
        inscription: { emails: [ "" ], send_email: false, show_tarifas: false }
    }, shortname: "", start_date: null, title: ""
});

const onGetInfoFromActivity = async() => {
    const { response }: InterfaceResponseActivities = await Api.Get({
        params: { shortname: route.params.slug as string }, route: `activity`
    });
    if (response && response.status === 200) {
        const info = response.data[0];
        if (info) {
            document.title = info.title;
            infoActivity.value = info;
        }
    }
};

onMounted(() => {
    onGetInfoFromActivity();
});

</script>

<template>
    <main class="bg-slate-900 text-white">
        <HeaderPage :infoActivity="infoActivity" v-reveal/>
        <HeroSection v-reveal/>
        <div class="left-0 w-full px-4 z-30 my-10">
            <TimerEventPage/>
        </div>
        <AboutEvent v-reveal/>
        <PricingSection v-reveal/>
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
