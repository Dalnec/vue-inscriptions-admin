<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { inject, onMounted, ref, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { InterfaceRates } from "@/types/InterfaceRates.ts";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const route = useRoute();
const router = useRouter();
const infoActivity = inject<Ref<InterfaceActivities>>("infoActivity");

const rates = ref<InterfaceRates[]>([]);
const loading = ref(false);

const slug = () => (route.params.slug as string) || infoActivity?.value?.shortname || "";

const fetchRates = async() => {
    const shortname = slug();
    if ( !shortname) return;
    try {
        loading.value = true;
        const { response } = await Api.Get({ route: "tarifa", params: { activity_shortname: shortname } });
        if (response?.status === 200) {
            rates.value = response.data.results ?? [];
        }
    } catch (e) {
        console.error("Error al obtener tarifas:", e);
    } finally {
        loading.value = false;
    }
};

const handleCTA = () => {
    router.push({ name: "event-inscription", params: { slug: slug() } });
};

onMounted(() => fetchRates());

</script>

<template>
    <section class="bg-event-bg py-20 px-4" id="pricing" v-if="rates.length > 0 || loading">
        <div class="max-w-6xl mx-auto">
            <!-- HEADER -->
            <div class="text-center mb-16">
                <div class="w-32 h-1 bg-event-accent mx-auto mb-6 rounded-full"></div>

                <h2 class="text-3xl md:text-5xl font-info text-white leading-tight motto-font">
                    INSCRIBITE YA!<!-- Tarifas disponibles -->
                </h2>

                <!-- <p class="mt-4 text-white/60 max-w-2xl mx-auto">
                    Elige el plan que mejor se adapte a ti
                </p> -->
            </div>

            <!-- LOADING -->
            <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="i in 2" :key="i" class="pricing-card">
                    <Skeleton width="60%" height="1.5rem" class="mb-4"/>
                    <Skeleton width="40%" height="2.5rem" class="mb-6"/>
                    <Skeleton width="100%" height="3rem"/>
                </div>
            </div>

            <!-- PLANS GRID -->
            <div v-else class="grid gap-8"
                 :class="rates.length === 1 ? 'max-w-md mx-auto' : rates.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'">

                <div v-for="(rate, index) in rates" :key="rate.id ?? index"
                     :class="['pricing-card', !rate.active && 'opacity-50 pointer-events-none']">

                    <!-- BADGE ACTIVO -->
                    <div v-if="rate.active && index === 0" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span class="bg-event-accent text-event-bg-dark px-4 py-1 rounded-full text-sm font-bold">
                            RECOMENDADO
                        </span>
                    </div>

                    <!-- CONTENIDO -->
                    <div class="flex flex-col h-full">
                        <!-- ENCABEZADO -->
                        <div class="mb-6">
                            <h3 class="text-2xl font-bold text-white mb-2">
                                {{ rate.description }}
                            </h3>
                            <Tag v-if="!rate.active" value="Inactiva" severity="secondary" class="mt-1"/>
                        </div>

                        <!-- PRECIO -->
                        <div class="mb-8">
                            <div class="flex items-baseline gap-2">
                                <span class="text-4xl font-bold text-white">
                                    S/ {{ rate.price }}
                                </span>
                            </div>
                        </div>

                        <!-- CTA BUTTON -->
                        <Button v-if="rate.active" @click="handleCTA"
                                label="Inscribirme"
                                class="w-full rounded-xl font-semibold py-3 mt-auto"
                                :class="index === 0
                                    ? 'bg-event-accent text-event-bg-dark hover:bg-event-accent-red'
                                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'"/>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.pricing-card {
    @apply relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm;
    transition: all 0.3s ease;
}

.pricing-card:hover {
    @apply bg-white/10 border-white/20;
    transform: translateY(-4px);
}
</style>



