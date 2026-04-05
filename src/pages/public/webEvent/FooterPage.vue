<script setup lang="ts">
import pageConfig from "@/assets/page_config.json";

const { footer, location } = pageConfig;

const menuItems = [
    { currentPage: "#about", label: "¿De qué se trata?" },
    { currentPage: "#pricing", label: "Tarifas" },
    { currentPage: "#location", label: "Ubícanos" }
];
</script>

<template>
    <footer class="bg-slate-950 text-white border-t border-white/10">

        <div class="max-w-6xl mx-auto px-4 py-16">

            <!-- TOP -->
            <div class="flex flex-col gap-10 md:flex-row md:justify-between md:items-center">

                <!-- LOGOS -->
                <div class="flex items-center gap-8">
                    <img src="../../../assets/images/jni.jpg" class="h-16 object-contain opacity-90" alt=""/>
                    <img src="../../../assets/images/kadosh.png" class="h-14 object-contain opacity-90" alt=""/>
                </div>

                <!-- REDES -->
                <div class="flex gap-5">
                    <a href="https://www.instagram.com/jni.dpno/" target="_blank"
                       class="social-link">
                        <i-lineicons-instagram-original/>
                    </a>

                    <a href="https://www.facebook.com/share/1FxQT4cJvg/" target="_blank"
                       class="social-link">
                        <i-ic-baseline-facebook/>
                    </a>
                </div>
            </div>

            <!-- GRID -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mt-14 text-sm">

                <!-- JNI -->
                <div>
                    <h3 class="footer-title">JNI</h3>
                    <ul class="footer-list">
                        <li>
                            <a href="https://www.instagram.com/jni.dpno/" target="_blank" class="footer-link">
                                Instagram
                            </a>
                        </li>
                        <li>
                            <a href="#" class="footer-link">NYI</a>
                        </li>
                    </ul>
                </div>

                <!-- KADOSH -->
                <div>
                    <h3 class="footer-title">Kadosh</h3>
                    <ul class="footer-list">
                        <li v-for="(item, index) in menuItems" :key="index">
                            <router-link
                                    :to="{ path: '/', hash: item.currentPage }"
                                    class="footer-link"
                            >
                                {{ item.label }}
                            </router-link>
                        </li>
                    </ul>
                </div>

                <!-- LINKS -->
                <div>
                    <h3 class="footer-title">Links</h3>
                    <ul class="footer-list">
                        <li>
                            <router-link to="/suscribe" class="footer-link">
                                Inscripción
                            </router-link>
                        </li>
                    </ul>
                </div>

                <!-- CONTACTO -->
                <div>
                    <h3 class="footer-title">Contacto</h3>
                    <p class="flex items-start gap-2 text-white/70 leading-relaxed">
                        <i class="pi pi-map-marker text-base mt-1"></i>
                        {{ location.address }}
                    </p>
                </div>
            </div>
        </div>

        <!-- CTA SECTION -->
        <div class="dark:bg-slate-400/10  border-y border-slate-400/20 px-4 py-12">
            <div class="max-w-6xl mx-auto text-center">
                <h2 class="text-2xl md:text-4xl font-info text-white mb-4">
                    {{ footer.cta_title }}
                </h2>
                <Button label="INSCRIBIRSE AHORA"
                        class="bg-amber-400 text-slate-950 hover:bg-amber-500 rounded-xl font-bold px-8 py-3"
                        @click="$router.push({ name: 'inscription-members' })"/>
            </div>
        </div>

        <!-- BOTTOM -->
        <div class="border-t border-white/10">
            <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:justify-between md:items-center text-xs text-white/60">

                <p> © {{ footer.year }} {{ footer.organization }}. Todos los derechos reservados </p>

                <p class="flex items-center gap-2">
                    Powered by
                    <a href="https://github.com/DanGosw?tab=repositories" target="_blank"
                       class="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"> DevRunner
                        <i-mdi-github/>
                    </a>
                </p>

            </div>
        </div>
    </footer>

</template>

<style scoped>

/* títulos */
.footer-title {
    @apply mb-4 text-white font-semibold tracking-wide;
}

/* listas */
.footer-list {
    @apply space-y-2;
}

/* links */
.footer-link {
    @apply text-white/70 hover:text-white transition-colors;
}

/* redes */
.social-link {
    @apply text-white/70 text-xl hover:text-white transition-colors;
}

</style>