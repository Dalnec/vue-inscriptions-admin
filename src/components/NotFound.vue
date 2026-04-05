<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();

const slug = computed(() => route.params.slug as string | undefined);

const goHome = () => {
    if (slug.value) {
        router.push({ name: "webPage", params: { slug: slug.value } });
    } else {
        router.push({ name: "webHome" });
    }
};

</script>

<template>
    <div class="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div class="max-w-xl w-full text-center">

            <!-- Código 404 -->
            <h1 class="text-7xl md:text-8xl font-bold text-amber-400 tracking-widest"> 404 </h1>

            <!-- Título -->
            <h2 class="mt-6 text-2xl md:text-3xl font-semibold"> Página no encontrada </h2>

            <!-- Descripción -->
            <p class="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
                La ruta que estás intentando acceder no existe o fue movida.
                Verifica la URL o regresa a una sección válida.
            </p>

            <!-- Contexto de evento -->
            <p v-if="slug" class="mt-2 text-xs text-slate-500">
                Evento: <span class="text-amber-400 font-medium">{{ slug }}</span>
            </p>

            <!-- Acciones -->
            <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button @click="goHome" label="Ir al inicio"/>
            </div>

            <!-- Divider -->
            <div class="mt-10 w-24 h-[2px] bg-white/10 mx-auto rounded-full"></div>

            <!-- Footer hint -->
            <p class="mt-4 text-xs text-slate-600">
                Si el problema persiste, contacta con soporte o revisa el acceso al evento.
            </p>
        </div>
    </div>
</template>
