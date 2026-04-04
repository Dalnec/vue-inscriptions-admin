<script setup lang="ts">

</script>

<template>
    <aside class="lg:col-span-1 space-y-8">
        <div class="bg-surface-container-low p-6 rounded-xl space-y-6">
            <h3 class="font-headline font-bold text-xl mb-4 text-on-surface">Filtros</h3>
            <div>
                <label class="font-label text-xs font-bold uppercase text-tertiary mb-3 block">Fecha</label>
                <select
                        class="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm focus:ring-primary/20">
                    <option>Todos los días</option>
                    <option>Hoy</option>
                    <option>Este fin de semana</option>
                    <option>Próximo mes</option>
                </select>
            </div>
            <div>
                <label class="font-label text-xs font-bold uppercase text-tertiary mb-3 block">Ubicación</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-3 text-sm">
                        <input class="rounded border-outline text-primary focus:ring-primary/20"
                               type="checkbox" /> Lima, Perú
                    </label>
                    <label class="flex items-center gap-3 text-sm">
                        <input class="rounded border-outline text-primary focus:ring-primary/20"
                               type="checkbox" /> Santiago, Chile
                    </label>
                    <label class="flex items-center gap-3 text-sm">
                        <input class="rounded border-outline text-primary focus:ring-primary/20"
                               type="checkbox" /> Buenos Aires, ARG
                    </label>
                </div>
            </div>
            <div>
                <label class="font-label text-xs font-bold uppercase text-tertiary mb-3 block">Rango de
                    Precio</label>
                <input
                        class="w-full h-1 bg-surface-container-highest appearance-none rounded-full accent-primary"
                        type="range" />
                <div class="flex justify-between mt-2 text-xs font-medium text-tertiary">
                    <span>S/ 0</span>
                    <span>S/ 1000+</span>
                </div>
            </div>
            <button
                    class="w-full py-3 border border-outline-variant/30 rounded-xl font-label text-xs font-bold uppercase hover:bg-primary-container/10 transition-all">Limpiar
                Filtros</button>
        </div>
    </aside>
</template>

<style scoped>

</style>