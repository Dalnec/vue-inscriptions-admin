<script setup lang="ts">

</script>

<template>
    <section class="relative px-6 py-8 max-w-screen-2xl mx-auto overflow-hidden">
        <div class="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
            <img class="absolute inset-0 w-full h-full object-cover" alt="Hero Image"
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy7TDCag3Nu1hnl6_sXiosO_TC_fw3lgQWefDER0dXjXAZfyh1mjlIz0RnOv_b9ixMM4V4ijUwLYrgM2uk-0jFQx5LtTvL0Wv19j86LOpu7BQ9fbgbJOUB5Y4tV4WAQSKgdMLgvj7AlO1Y2cHVBgbw4HTqWq-xwy5srZk-Dz3PwL5SW9G2kaJtAlNwZM0vlPuqHvgejGmNnHp04dMHV8R9g4PPoD1Xpge1glgxmRmT83XaEQz0lrHlkknTIy9DyjNKjiSEZC8ScDWx"/>
            <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-16">
                <span class="inline-block px-4 py-1 bg-primary text-on-primary font-label text-xs font-bold rounded-full mb-4 w-fit uppercase tracking-widest">Destacado</span>
                <h1 class="text-white font-headline text-6xl font-bold tracking-tight mb-4 max-w-2xl leading-[1.1] text-shadow-premium">
                    Retiro Juvenil <span class="text-primary-container">2024</span></h1>
                <p class="text-zinc-200 font-body text-lg mb-8 max-w-lg">Vive la experiencia más transformadora del
                    año en la naturaleza. Música en vivo, conferencias y comunidad.</p>
                <div class="flex gap-4">
                    <Button unstyled label="INSCRIBIRSE"
                            class="kinetic-gradient text-on-primary px-8 py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-105 transition-transform"/>
                    <Button unstyled label="VER DETALLES"
                            class="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">

                    </Button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>