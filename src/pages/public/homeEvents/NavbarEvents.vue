<script setup lang="ts">

</script>

<template>
    <nav class="fixed top-0 w-full z-50 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl">
        <div class="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
            <div class="flex items-center gap-8">
                <span
                        class="text-2xl font-black text-red-700 dark:text-red-500 italic tracking-tighter font-headline">KINETIC
                    STAGE</span>
                <div class="hidden md:flex items-center space-x-6 font-headline font-bold tracking-tight">
                    <a class="text-red-700 dark:text-red-500 border-b-2 border-red-700 dark:border-red-500 pb-1"
                       href="#">Música</a>
                    <a class="text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors" href="#">Teatro</a>
                    <a class="text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors"
                       href="#">Deportes</a>
                    <a class="text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors"
                       href="#">Cultura</a>
                </div>
            </div>
            <div class="flex items-center gap-4 flex-1 max-w-md mx-8">
                <div class="relative w-full">
                    <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">search</span>
                    <input
                            class="w-full bg-surface-container-highest border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            placeholder="Busca tu próximo evento..." type="text" />
                </div>
            </div>
            <div class="flex items-center gap-4">
                <button
                        class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all scale-95 active:scale-90 duration-200">
                    <span class="material-symbols-outlined text-zinc-600">shopping_cart</span>
                </button>
                <button
                        class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all scale-95 active:scale-90 duration-200">
                    <span class="material-symbols-outlined text-zinc-600">account_circle</span>
                </button>
            </div>
        </div>
    </nav>
</template>

<style scoped>

</style>