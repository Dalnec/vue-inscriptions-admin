<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import AppConfig from "@/components/app/appConfig.vue";
import { optionsMenuStore } from "@/stores/optionsMenu";
import type { MenuItem } from "primevue/menuitem";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useConfirm } from "primevue";
import toastEvent from "@/composables/toastEvent.ts";
import router from "@/router";

const route = useRoute();
const confirm = useConfirm();
const menu = ref();
const userDataStore = useUserDataConfigStore();
const userDataValue = userDataStore.userData.user;

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

const items = () => {
    const optionsMenu: MenuItem[] = [
        {
            label: "Cerrar Sesión", command: () => confirm1()
        }
    ];
    if (userDataValue.is_superuser || userDataValue.profile_description === "ADMINISTRADOR") {
        optionsMenu.push({
            label: "Configuraciones", command: () => router.push({ name: "settings" })
        });
    }
    return optionsMenu;
};

const onShowOptions = (event: MouseEvent) => {
    menu.value.toggle(event);
};

</script>

<template>
    <Menubar :model="menuOptions" class="text-[12px]" breakpoint="840px">
        <template #start>
            <div class="mr-1 flex h-9 w-14 items-center justify-center rounded-md">
                <img src="/kadosh.png" class="h-8" alt="logo">
            </div>
        </template>
        <template #item="{ item, props }">
            <router-link v-if="item.route && !item.items" :to="item?.route" v-slot="{href, navigate}">
                <a @click="navigate" class="cursor-pointer" v-bind="props.action" :href
                   :class="`select-none ${isParentActive(item.route) ? 'bg-primary-500/80 rounded' : ''}`" v-ripple>
                    <component :is="item.icon" :class="`${isParentActive(item.route) ? 'text-white' : 'text-primary-500'} text-[15px]`"/>
                    <span :class="`${isParentActive(item.route) ? 'text-white' : 'text-surface-900 dark:text-surface-200'} ml-1`">
                        {{ item.label }}
                    </span>
                </a>
            </router-link>
            <a v-else class="flex cursor-pointer select-none items-center pl-1 py-1.5" :href="item?.route" v-bind="props.action"
               :class="isChildActive(item.items || []) ? 'bg-primary-500/40 rounded' :''" v-ripple>
                <component :is="item.icon" class="text-primary-500 text-[15px]"/>
                <span class="ml-1.5">{{ item.label }}</span>
                <i-material-symbols-keyboard-arrow-down-rounded class="text-[16px] text-primary-500 mx-0.5"/>
            </a>
        </template>

        <template #submenuicon>
            <i-solar-hamburger-menu-broken/>
        </template>

        <template #end>
            <div class="flex space-x-1">
                <Button size="small" severity="secondary" class="!w-8 !h-8" @click="onShowOptions" aria-haspopup="true"
                        aria-controls="overlayMenu">
                    <template #icon>
                        <i-material-symbols-person-outline-rounded/>
                    </template>
                </Button>
                <TieredMenu ref="menu" id="overlayMenu" :model="items()" popup/>
                <app-config/>
            </div>
        </template>
    </Menubar>
</template>
