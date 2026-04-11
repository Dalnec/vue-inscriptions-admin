<script setup lang="ts">
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";
import "leaflet/dist/leaflet.css";
import happyYoung from "@/assets/images/imgYoungs.jpg";
import { inject, computed, type Ref } from "vue";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";

const infoActivity = inject<Ref<InterfaceActivities>>("infoActivity");

const lat = computed(() => infoActivity?.value?.location?.lat ?? 0);
const lng = computed(() => infoActivity?.value?.location?.lng ?? 0);
const locationText = computed(() => infoActivity?.value?.location_text || "Ubicación del evento");
const hasValidCoords = computed(() => lat.value !== 0 || lng.value !== 0);
const mapCenter = computed(() => [lat.value, lng.value] as [number, number]);
</script>

<template>
    <section class="bg-event-bg-dark py-20 px-4" id="location">
        <div class="max-w-6xl mx-auto">

            <!-- HEADER -->
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-info text-white">
                    ¿Dónde será el evento?
                </h2>
                <p class="mt-4 text-white/60 max-w-2xl mx-auto">
                    {{ locationText }}
                </p>
            </div>

            <!-- CONTENT -->
            <div class="grid md:grid-cols-2 gap-10 items-center">

                <!-- MAPA -->
                <div class="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <template v-if="hasValidCoords">
                        <LMap :zoom="15" :center="mapCenter" :use-global-leaflet="false" class="w-full h-full">
                            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <LMarker :lat-lng="mapCenter"/>
                        </LMap>
                    </template>
                    <div v-else class="flex items-center justify-center h-full bg-event-bg text-white/40">
                        <p>Ubicación no disponible</p>
                    </div>
                </div>

                <!-- TEXTO -->
                <div class="relative rounded-2xl overflow-hidden shadow-2xl"
                     :style="`background-image: url(${happyYoung})`">
                    <!-- overlay -->
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                    <!-- contenido -->
                    <div class="relative p-8 text-white">

                        <h3 class="text-2xl md:text-4xl font-info mb-4"> {{ locationText }} </h3>

                        <p class="text-white/70 leading-relaxed">
                            <span class="text-event-accent font-semibold">{{ infoActivity?.title }}</span>
                            — {{ locationText }}
                        </p>

                        <p v-if="infoActivity?.description" class="mt-4 text-white/50 text-sm">
                            {{ infoActivity.description }}
                        </p>

                        <!-- CTA opcional -->
                        <Button v-if="hasValidCoords" as="a"
                                :href="`https://www.google.com/maps?q=${lat},${lng}`"
                                target="_blank" label="Ver en Google Maps" class="mt-6"/>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>