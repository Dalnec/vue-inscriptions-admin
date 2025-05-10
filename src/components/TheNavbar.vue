<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import AppConfig from "@/components/app/appConfig.vue";
import { optionsMenuStore } from "@/stores/optionsMenu";
import type { MenuItem } from "primevue/menuitem";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useConfirm } from "primevue";
import toastEvent from "@/composables/toastEvent.ts";

const route = useRoute();
const router = useRouter();
const userDataStore = useUserDataConfigStore();
const confirm = useConfirm();

optionsMenuStore.createOptionsMenu();

const menuOptions = computed(() => optionsMenuStore.options);

const isParentActive = (parentRoute: string): boolean => {
    return route?.matched.some((matchedRoute) => {
        return matchedRoute.path === parentRoute || matchedRoute.name === parentRoute;
    });
};

const isChildActive = (childrenRoutes: MenuItem[]): boolean => {
    return childrenRoutes.some((child) => {
        return route.matched.some((matchedRoute) => matchedRoute.path === child.route);
    });
};

const handleNavigation = (route: string | { name: string }): void => {
    if (typeof route === "string") {
        router.push(route);
    } else if (route?.name) {
        router.push({ name: route.name });
    } else {
        console.warn("Invalid route:", route);
    }
};

const confirm1 = () => {
    confirm.require({
        message: "¿Estas seguro de cerrar sesión?",
        header: "Confirmación",
        rejectProps: {
            label: "Cancelar",
            severity: "secondary",
            outlined: true
        },
        acceptProps: {
            label: "Cerrar"
        },
        accept: () => {
            userDataStore.logout();
            toastEvent({ severity: "info", summary: "Sesión expirada", message: "Vuelva a iniciar sesión", life: 3000 });
        },
        reject: () => {
            toastEvent({ severity: "error", summary: "Cancelado", message: "No se cerro la sesión", life: 3000 });
        }
    });
};

</script>

<template>
    <Menubar :model="menuOptions" class="text-[12px]" breakpoint="840px">
        <template #start>
            <div class="mr-1 flex h-9 w-14 items-center justify-center rounded-md">
                <img src="../../public/kadosh.png" class="h-8" alt="logo">
            </div>
        </template>
        <template #item="{ item, props }">
            <div v-if="item.route && !item.items">
                <div @click="handleNavigation(item.route)" class="cursor-pointer" v-bind="props.action"
                     :class="`select-none ${isParentActive(item.route) ? 'bg-primary-500/80 rounded' : ''}`" v-ripple>
                    <component :is="item.icon" :class="`${isParentActive(item.route) ? 'text-white' : 'text-primary-500'} text-[15px]`"/>
                    <span :class="`${isParentActive(item.route) ? 'text-white' : 'text-surface-900 dark:text-surface-200'} ml-1`">
                        {{ item.label }}
                    </span>
                </div>
            </div>
            <div v-else class="flex cursor-pointer select-none items-center pl-1 py-1.5"
                 :class="isChildActive(item.items || []) ? 'bg-primary-500/40 rounded' :''" v-ripple>
                <component :is="item.icon" class="text-primary-500 text-[15px]"/>
                <span class="ml-1.5">{{ item.label }}</span>
                <i-material-symbols-keyboard-arrow-down-rounded class="text-[16px] text-primary-500 mx-0.5"/>
            </div>
        </template>

        <template #submenuicon>
            <i-solar-hamburger-menu-broken/>
        </template>

        <template #end>
            <div class="flex space-x-1">
                <Button size="small" severity="secondary" class="!w-8 !h-8" @click="confirm1"
                        v-tooltip.bottom="'Cerrar Sesión'">
                    <template #icon>
                        <i-material-symbols-person-outline-rounded/>
                    </template>
                </Button>
                <app-config/>
            </div>
        </template>
    </Menubar>
</template>
