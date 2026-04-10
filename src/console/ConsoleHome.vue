<script setup lang="ts">
import { navBarStore } from "@/stores/optionsMenu.ts";
import { computed, ref, watch } from "vue";
import { useDark } from "@vueuse/core";
import { useUserConsoleStore } from "@/stores/loginStore/storeUserDataConsole.ts";
import { RouterLink, RouterView, useRoute } from "vue-router";
import type { MenuItem } from "primevue/menuitem";

const useUserStore = useUserConsoleStore();

navBarStore().createOptionsMenu();
const isDark = useDark({ disableTransition: false, initialValue: "light" });
const isSidebarOpen = ref(false);
const menuOptions = computed(() => navBarStore().options);

function toggleDarkMode() {
    isDark.value = !isDark.value;
}

const route = useRoute();

const menuRef = ref();
const items = ref<MenuItem[]>([
    {
        label: "Cerrar sesión",
        command: () => {
            useUserStore.logoutUserConsole();
        }
    }
]);

const toggle = (event: MouseEvent) => {
    menuRef.value.toggle(event);
};

watch(() => route.fullPath, () => {
    if (window.innerWidth < 768) {
        isSidebarOpen.value = false;
    }
});

</script>

<template>
    <div class="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

        <!-- Sidebar -->
        <aside
                class="fixed inset-y-0 left-0 z-20 w-56 bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col transform transition-transform duration-300
         md:relative md:translate-x-0"
                :class="{'-translate-x-full': !isSidebarOpen, 'translate-x-0': isSidebarOpen}"
        >
            <!-- Header sidebar -->
            <div class="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-400 dark:border-gray-800">
                <h1 class="text-2xl font-bold italic">Regis</h1>
                <button class="md:hidden p-1" @click="isSidebarOpen = false">
                    <i class="i-ic-round-close"></i>
                </button>
            </div>

            <!-- Menú scrollable -->
            <nav class="flex-1 overflow-auto px-4 py-2 space-y-2">
                <RouterLink v-for="option in menuOptions" :key="option.label" :to="option.path!"
                            class="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-cyan-500 dark:hover:bg-gray-800 transition-colors"
                            active-class="bg-cyan-600" exact>
                    <component :is="option.icon" class="w-5 h-5"/>
                    <span class="font-medium">{{ option.label }}</span>
                </RouterLink>
            </nav>

            <!-- Footer fijo -->
            <div class="flex items-center gap-3 p-2 border-t border-gray-400 dark:border-gray-800 flex-shrink-0">
                <Button @click="toggle" class="h-12 w-12" rounded severity="secondary" #icon>
                    <i-material-symbols-account-circle-full class="text-lg"/>
                </Button>
                <Menu ref="menuRef" id="overlay_menu" :model="items" :popup="true"/>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold truncate">{{ useUserStore.userInfo.user?.username }}</span>
                </div>
            </div>
        </aside>

        <!-- Overlay móvil -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"></div>

        <!-- Botón menú móvil -->

        <!-- Overlay móvil -->
        <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"></div>

        <!-- Main content -->
        <main class="flex-1 flex flex-col overflow-hidden">

            <!-- Header fijo -->
            <header class="flex items-center justify-between p-4 gap-3 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
                <Button class="md:hidden" @click="isSidebarOpen = !isSidebarOpen" #icon>
                    <i-material-symbols-segment-rounded class="text-lg"/>
                </Button>
                <div class="flex items-center gap-3 flex-shrink-0">
                    <Button @click="toggleDarkMode" severity="secondary" class="p-2" #icon>
                        <i-ic-round-light-mode v-if="isDark"/>
                        <i-ic-round-dark-mode v-else/>
                    </Button>
                </div>
            </header>

            <!-- Contenido scrollable -->
            <div class="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-950">
                <RouterView v-slot="{ Component, route }">
                    <Transition mode="out-in" name="fade">
                        <component :is="Component" :key="route.fullPath" class="w-full"/>
                    </Transition>
                </RouterView>
            </div>

        </main>

    </div>
</template>