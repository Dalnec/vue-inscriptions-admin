<script setup lang="ts">
import LoadingPage from "@/components/loadingPage.vue";
import { ref, onMounted, watch } from "vue";
import { useDark } from "@vueuse/core";
import Toast from "primevue/toast";
import { storeActivities, storeChurches, storeDocumentType, storeKind, storePaymentMethod, storeRate } from "@/stores/generalInfoStore.ts";

const loadingPage = ref(true);
const isDark = useDark({ disableTransition: false, initialValue: "auto" });

onMounted(() => {
    window.addEventListener("load", () => {
        setTimeout(() => {
            loadingPage.value = false;
        }, 1500);
    });
});

watch(isDark, (newVal) => {
    if (newVal) document.body.classList.add("dark");
    else document.body.classList.remove("dark");

}, { immediate: true });


onMounted(async() => {
    await storeChurches().getDataChurches();
    await storeDocumentType().getDocumentType();
    await storePaymentMethod().getPaymentMethod();
    await storeActivities().getActivities();
    await storeRate().getRates();
    await storeKind().getKinds();
});

</script>

<template>
    <div :class="`flex h-screen w-full items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`" v-if=loadingPage>
        <div>
            <loadingPage/>
        </div>
    </div>
    <div v-else>
        <router-view/>
        <Toast position="top-left"/>
        <ConfirmDialog/>
    </div>
</template>
