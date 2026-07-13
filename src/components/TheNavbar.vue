<script setup lang="ts">
import { navBarStore } from "@/stores/optionsMenu";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useUserConsoleStore } from "@/stores/loginStore/storeUserDataConsole.ts";
import { useRoute } from "vue-router";
import { useConfirm } from "primevue";
import useGlobalToast from "@/composables/toastEvent.ts";
import AppConfig from "@/components/app/appConfig.vue";
import type { MenuItem } from "primevue/menuitem";
import { computed, inject, ref, type Ref } from "vue";

const route = useRoute();

const eventLogo = inject<Ref<string | null>>("eventLogo", ref(null));

const navbarLogo = computed(() => {
    if (slug.value && eventLogo.value) return eventLogo.value;
    return "/kadosh.png";
});
const userDataStore = useUserDataConfigStore();
const consoleStore = useUserConsoleStore();
const confirm = useConfirm();
const menu = ref();

const isConsoleAuth = computed(() =>
    !!consoleStore.userInfo?.token &&
    !!consoleStore.userInfo?.user &&
    Object.keys(consoleStore.userInfo.user).length > 0
);

const isConsole = computed(() => route.path.startsWith("/console"));
const slug = computed(() => route.params.slug as string | undefined);

navBarStore().createOptionsMenu();

const menuOptions = computed(() => navBarStore().options);

const isParentActive = (routeName: string): boolean => {
    return route.matched.some((r) => r.name === routeName);
};

const isChildActive = (childrenRoutes: MenuItem[]): boolean => {
    return childrenRoutes.some((child) => {
        return route.matched.some((r) => r.name === child.key);
    });
};

const confirm1 = () => {
    confirm.require({
        accept: () => {
            userDataStore.logout({ slug: slug.value as string });
            useGlobalToast({ severity: "info", summary: "Sesión expirada", detail: "Vuelva a iniciar sesión", life: 3000 });
        },
        acceptProps: {
            label: "Cerrar"
        },
        header: "Confirmación",
        message: "¿Estas seguro de cerrar sesión?",
        reject: () => {
            useGlobalToast({ severity: "error", summary: "Cancelado", detail: "No se cerro la sesión", life: 3000 });
        },
        rejectProps: {
            label: "Cancelar",
            outlined: true,
            severity: "secondary"
        }
    });
};

const items = () => {
    const optionsMenu: MenuItem[] = [
        {
            label: "Cerrar Sesión", command: () => confirm1()
        }
    ];
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
                <img :src="navbarLogo" class="h-8 rounded object-contain" alt="logo">
            </div>
        </template>
        <template #item="{ item, props }">
            <router-link v-if="item.route && !item.items" :to="item?.route" v-slot="{href, navigate}">
                <a @click="navigate" class="cursor-pointer" v-bind="props.action" :href
                   :class="`select-none ${isParentActive(item.key!) ? 'bg-primary-500/80 rounded' : ''}`" v-ripple>
                    <component :is="item.icon" :class="`${isParentActive(item.key!) ? 'text-white' : 'text-primary-500'} text-[15px]`"/>
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
            <i-material-symbols-menu-rounded/>
        </template>

        <template #end>
            <div class="flex items-center space-x-1">
                <router-link v-if="isConsoleAuth" :to="{ name: 'console-events-list' }">
                    <Button size="small" severity="info" class="!h-8" v-tooltip.bottom="'Ir a Console'" #icon>
                        <i-material-symbols-admin-panel-settings-outline-rounded/>
                    </Button>
                </router-link>
                <Button :label="userDataStore.userData.user?.username" size="small" severity="secondary" class="!h-8" @click="onShowOptions"
                        aria-haspopup="true" aria-controls="overlayMenu" #icon>
                    <i-material-symbols-person-outline-rounded/>
                </Button>
                <TieredMenu ref="menu" id="overlayMenu" :model="items()" popup/>
                <app-config/>
            </div>
        </template>
    </Menubar>
</template>
