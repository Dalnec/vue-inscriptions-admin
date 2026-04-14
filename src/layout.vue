<script setup lang="ts">
import TheNavbar from "@/components/TheNavbar.vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { Api } from "@/api/connection.ts";
import { setFavicon } from "@/composables/useFavicon.ts";

const route = useRoute();

onMounted(async () => {
    const slug = route.params.slug as string;
    if (!slug) return;
    const { response } = await Api.Get({ params: { shortname: slug }, route: "activity" });
    if (response?.status === 200 && response.data[0]) {
        const info = response.data[0];
        document.title = info.shortname || info.title;
        if (info.logo) setFavicon(info.logo);
    }
});

</script>

<template>
    <div class="h-screen flex flex-col dark:bg-surface-950">
        <!-- TheNavbar container -->
        <div class="mt-2">
            <the-navbar class="sticky top-0 bottom-2 z-50 mx-2"/>
        </div>
        <!-- Main content area -->
        <RouterView v-slot="{ Component, route }">
            <Transition mode="out-in">
                <main :key="route.name" class="mt-4 flex-1 overflow-y-auto min-h-0 w-full px-2 sm:px-4 md:px-8 lg:px-12">
                    <component :is="Component"/>
                </main>
            </Transition>
        </RouterView>
    </div>
</template>
