<script setup lang="ts">
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";
import "leaflet/dist/leaflet.css";
import happyYoung from "@/assets/images/imgYoungs.jpg";

const lat = -6.4183;
const lng = -76.5283;

</script>

<template>
    <section class="bg-slate-950 py-20 px-4">
        <div class="max-w-6xl mx-auto">

            <!-- HEADER -->
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-5xl font-info text-white">
                    ¿Dónde será el evento?
                </h2>
                <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                    Un lugar preparado para vivir una experiencia única con Dios
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

                        <h3 class="text-2xl md:text-4xl font-info mb-4"> Lamas, Perú </h3>

                        <p class="text-slate-300 leading-relaxed">
                            Conocida como la <span class="text-amber-400 font-semibold">
                            Capital Folclórica de la Amazonía Peruana</span>, Lamas ofrece
                            un entorno perfecto para desconectarte y conectar con Dios.
                        </p>

                        <p class="mt-4 text-slate-400 text-sm">
                            I.E. Martín de la Riva y Herrera
                            <br/>
                            Jr. San Martín 2193 - Barrio Ancoallo
                        </p>

                        <!-- CTA opcional -->
                        <Button as="a" href="https://www.google.com/maps?q=-6.4183,-76.5283" target="_blank"
                                label="Ver en Google Maps" class="mt-6"/>

                    </div>
                </div>

            </div>
        </div>
    </section>
</template>