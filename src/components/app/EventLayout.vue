<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Api } from "@/api/connection.ts";
import HeaderPage from "@/pages/public/webEvent/HeaderPage.vue";
import EventDisabled from "@/pages/public/webEvent/EventDisabled.vue";
import type { InterfaceActivities, InterfaceResponseActivities } from "@/types/interfaceActivities.ts";
import { setFavicon } from "@/composables/useFavicon.ts";

const route = useRoute();

const infoActivity = ref<InterfaceActivities>({
    created: null, description: "", end_date: null, is_active: false, location: { lat: null, lng: null },
    location_text: "", logo: "", modified: null, settings: {
        inscription: { emails: [ "" ], send_email: false, show_tarifas: false }
    }, shortname: "", start_date: null, title: ""
});

const dataLoaded = ref(false);

const isEventDisabled = computed(() =>
    dataLoaded.value && !infoActivity.value.is_active
);


const onGetInfoFromActivity = async() => {
    const slug = route.params.slug as string;
    if ( !slug) return;
    dataLoaded.value = false;
    const { response }: InterfaceResponseActivities = await Api.Get({
        params: { shortname: slug }, route: "activity"
    });
    if (response && response.status === 200) {
        const info = response.data[0];
        if (info) {
            document.title = info.shortname || info.title;
            if (info.logo) {
                setFavicon(info.logo);
            }
            infoActivity.value = info;
        }
    }
    dataLoaded.value = true;
};

// Proveer la info de la actividad a todas las vistas hijas
provide("infoActivity", infoActivity);

// Determinar si se debe mostrar el header (no en login ni en 404 del evento)
const showHeader = computed(() => {
    const name = route.name as string;
    return ![ "event-login", "event-not-found" ].includes(name);
});

// Recargar datos al cambiar de slug (navegación entre eventos)
watch(() => route.params.slug, () => {
    onGetInfoFromActivity();
});

onMounted(() => {
    onGetInfoFromActivity();
});
</script>

<template>
    <div class="bg-event-bg min-h-screen text-white">
        <template v-if="isEventDisabled">
            <EventDisabled/>
        </template>
        <template v-else>
            <HeaderPage v-if="showHeader" :infoActivity="infoActivity"/>
            <router-view/>
        </template>
    </div>
</template>