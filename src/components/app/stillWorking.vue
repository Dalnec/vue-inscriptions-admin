<script setup lang="ts">
</script>

<template>
    <div class="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
        <div class="max-w-xl w-full text-center">

            <!-- Badge -->
            <div class="inline-block px-4 py-1 mb-6 text-xs tracking-widest uppercase bg-amber-400/10 text-amber-400 rounded-full">
                En desarrollo
            </div>

            <!-- Title -->
            <h1 class="text-3xl md:text-5xl font-bold leading-tight">
                Estamos trabajando en algo
                <span class="block text-amber-400 mt-2">mejor para ti</span>
            </h1>

            <!-- Description -->
            <p class="mt-6 text-slate-400 text-sm md:text-base max-w-md mx-auto">
                Esta sección aún no está disponible. Estamos afinando los últimos detalles para ofrecerte una mejor experiencia.
            </p>

            <!-- Divider -->
            <div class="w-24 h-1 bg-amber-400 mx-auto my-8 rounded-full"></div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <RouterLink to="/camp2026"
                            class="px-6 py-2 bg-amber-400 text-slate-900 font-medium rounded-lg hover:bg-amber-300 transition">
                    Ver evento actual
                </RouterLink>
            </div>

            <!-- Footer note -->
            <p class="mt-10 text-xs text-slate-500">
                © 2026 — Plataforma en construcción
            </p>
        </div>
    </div>
</template>