<script setup lang="ts">
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";
import "leaflet/dist/leaflet.css";
import happyYoung from "@/assets/images/imgYoungs.jpg";
import pageConfig from "@/assets/page_config.json";

const { location } = pageConfig;

const lat = -7.1;
const lng = -76.7;

</script>

<template>
    <section class="bg-slate-950 py-20 px-4" id="location">
        <div class="max-w-6xl mx-auto">

            <!-- HEADER -->
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-info text-white">
                    ¿Dónde será el evento?
                </h2>
                <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                    {{ location.description }}
                </p>
            </div>

            <!-- CONTENT -->
            <div class="grid md:grid-cols-2 gap-10 items-center">

                <!-- MAPA -->
                <div class="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

                    <LMap :zoom="18" :center="[lat, lng]" :use-global-leaflet="false" class="w-full h-full">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <LMarker :lat-lng="[lat, lng]"/>
                    </LMap>

                </div>

                <!-- TEXTO -->
                <div class="relative rounded-2xl overflow-hidden shadow-2xl"
                     :style="`background-image: url(${happyYoung})`">
                    <!-- overlay -->
                    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                    <!-- contenido -->
                    <div class="relative p-8 text-white">

                        <h3 class="text-2xl md:text-4xl font-info mb-4"> {{ location.city }} </h3>

                        <p class="text-slate-300 leading-relaxed">
                            <span class="text-amber-400 font-semibold">{{ location.place_name }}</span>
                            - {{ location.address }}
                        </p>

                        <p class="mt-4 text-slate-400 text-sm">
                            {{ location.description }}
                        </p>

                        <!-- AMENIDADES -->
                        <div v-if="location.amenities && location.amenities.length > 0" class="mt-6 space-y-2">
                            <h4 class="text-amber-400 font-semibold mb-3">Comodidades:</h4>
                            <ul>
                                <li v-for="(amenity, index) in location.amenities" :key="index"
                                    class="text-slate-300 flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                    {{ amenity }}
                                </li>
                            </ul>
                        </div>

                        <!-- CTA opcional -->
                        <Button as="a" href="https://www.google.com/maps?q=-7.1,-76.7" target="_blank"
                                label="Ver en Google Maps" class="mt-6"/>

                    </div>
                </div>

            </div>
        </div>
    </section>
</template>