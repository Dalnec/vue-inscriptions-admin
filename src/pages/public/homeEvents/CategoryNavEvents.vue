<script setup lang="ts">

</script>

<template>
    <section class="px-6 py-12 max-w-screen-2xl mx-auto">
        <div class="flex flex-wrap items-center gap-4 justify-center">
            <Button label="Música" size="large" unstyled
                    class="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-container rounded-full font-label text-sm font-bold transition-all shadow-sm"
                    #icon>
                <i-material-symbols-music-note/>
            </Button>
            <Button label="Teatro" size="large" unstyled
                    class="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface-variant hover:bg-secondary-container/30 rounded-full font-label text-sm font-bold transition-all"
                    #icon>
                <i-material-symbols-theater-comedy/>
            </Button>
            <Button label="Deportes" size="large" unstyled
                    class="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface-variant hover:bg-secondary-container/30 rounded-full font-label text-sm font-bold transition-all"
                    #icon>
                <i-material-symbols-sports-soccer/>
            </Button>
            <Button label="Cultura" size="large" unstyled
                    class="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface-variant hover:bg-secondary-container/30 rounded-full font-label text-sm font-bold transition-all"
                    #icon>
                <i-material-symbols-museum/>
            </Button>
            <Button label="Campamentos" size="large" unstyled
                    class="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface-variant hover:bg-secondary-container/30 rounded-full font-label text-sm font-bold transition-all"
                    #icon>
                <i-material-symbols-camping/>
            </Button>
        </div>
    </section>
</template>
