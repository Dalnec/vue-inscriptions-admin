<script setup lang="ts">
import TheNavbar from "@/components/TheNavbar.vue";
import { storeActivities, storeActivityActive, storeChurches, storeDocumentType, storeKind, storePaymentMethod, storeRate } from "@/stores/generalInfoStore.ts";
import { onMounted } from "vue";

onMounted(async() => {
    await storeChurches().getDataChurches();
    await storeDocumentType().getDocumentType();
    await storePaymentMethod().getPaymentMethod();
    await storeActivities().getActivities();
    await storeRate().getRates();
    await storeKind().getKinds();
    await storeActivityActive().getActiveActivity();
});

</script>
<template>
    <div class="h-screen flex flex-col dark:bg-surface-950">
        <!-- TheNavbar container -->
        <div class="mt-2">
            <the-navbar class="sticky top-0 bottom-2 z-50 mx-2"/>
        </div>
        <!-- Main content area -->
        <div class="flex-1 w-full overflow-auto p-2">
            <router-view v-slot="{ Component }">
                <transition mode="out-in">
                    <component :is="Component"/>
                </transition>
            </router-view>
        </div>
    </div>
</template>
