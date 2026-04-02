import { createRouter, createWebHistory } from "vue-router";
import { useMembersStore } from "@/stores/storeMembers.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useMembersStorePage } from "@/stores/StoreMembersPage.ts";
import SearchValidRoute from "@/composables/searchRouteValid.ts";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/home", name: "home", redirect: { name: "newRegister" }, component: () => import("@/layout.vue"),
            children: [
                {
                    path: "/register", name: "newRegister", component: () => import("@/modules/registers/registersCard.vue"),
                    meta: { label: "Nueva Inscripción", icon: IconMaterialSymbolsAddNotesOutline }
                },
                { path: "/settings", name: "settings", component: () => import("@/modules/settings/concepts.vue") },
                {
                    path: "/pay-event", name: "payEvent", component: () => import("@/modules/registers/payEventView.vue"),
                    beforeEnter: async() => {
                        const membersStoreOptions = useMembersStorePage();
                        if (membersStoreOptions.membersData.length === 0) {
                            toastEvent({ severity: "warn", summary: "Error al pagar", detail: "Agregue una persona al menos" });
                            await router.push({ name: "newRegister" });
                            return;
                        }
                    }
                },
                {
                    path: "/inscriptions", name: "inscriptions", component: () => import("@/modules/inscriptions/inscriptions.vue"),
                    meta: {
                        label: "Inscripciones", icon: IconMaterialSymbolsFrameInspectRounded,
                        permissions: [
                            { name: "Permiso 1" },
                            { name: "Permiso 2" },
                            { name: "Permiso 3" },
                            { name: "Permiso 4" },
                            { name: "Permiso 5" }
                        ]
                    }
                },
                {
                    path: "/users", name: "users", component: () => import("@/modules/users/users.vue"),
                    meta: {
                        label: "Usuarios", icon: IconMaterialSymbolsGroupOutlineRounded, superOnly: true
                    }
                },
                {
                    path: "/caja", name: "caja", component: () => import("@/modules/caja/caja.vue"),
                    meta: {
                        label: "Caja", icon: IconMaterialSymbolsAccountBalanceWalletOutline, superOnly: true
                    }
                },
                {
                    path: "/settings", name: "settings", component: () => import("@/modules/settings/index.vue"),
                    meta: {
                        label: "Configuraciones", icon: IconMaterialSymbolsCalendarAppsScript, superOnly: true
                    }
                },
                {
                    path: "/concepts-caja", name: "conceptsCaja", component: () => import("@/modules/tillConcept/TillConcepts.vue"),
                    meta: { superOnly: true }
                },
                {
                    path: "/event", name: "event", component: () => import("@/modules/settings/eventManage.vue"),
                    meta: { superOnly: true }
                },
                {
                    path: "/concepts", name: "concepts", component: () => import("@/modules/settings/concepts.vue"),
                    meta: { superOnly: true }
                },
                {
                    path: "/activities", name: "activities", component: () => import("@/modules/activities/activities.vue"),
                    meta: {
                        label: "Actividades", icon: IconMaterialSymbolsEventNoteOutline, superOnly: true
                    }
                }
            ]
        },
        { path: "/", name: "webPage", component: () => import("@/pages/public/webEvent/HomePage.vue"), meta: { public: true } },
        { path: "/login", name: "login", component: () => import("@/pages/login.vue"), meta: { public: true } },
        {
            component: () => import("@/pages/public/registerMembers/RegisterMemberEvent.vue"),
            meta: { public: true },
            name: "inscription-members",
            path: "/inscribete"
        },
        {
            component: () => import("@/pages/public/registerMembers/FormPayMembers.vue"),
            meta: { public: true },
            name: "pay-inscription-members",
            path: "/pagar",
            beforeEnter: async() => {
                const membersStoreOptions = useMembersStore();
                if (membersStoreOptions.membersData.length === 0) {
                    toastEvent({ severity: "warn", summary: "Error al pagar", detail: "Agregue una persona al menos" });
                    await router.push({ name: "newRegister" });
                    return;
                }
            }
        },
        { path: "/view-event", name: "viewEvent", component: () => import("@/pages/login.vue"), meta: { public: true } },
        { path: "/:catchAll(.*)", name: "Page not found", redirect: "/" }
    ]
});
router.beforeEach((to) => {
    const store = useUserDataConfigStore();

    const isAuth = !!store.userData.token;
    const isStaff = store.userData.user?.is_staff === true;

    const isPublic = to.meta?.public === true;

    if (isPublic) {
        return true;
    }

    if (to.path.startsWith("/home")) {
        if ( !isAuth) {
            return { name: "login" };
        }
    }

    if (isAuth && to.name === "login") {
        return { name: "home" };
    }

    if (isAuth) {
        if (isStaff) {
            return true;
        }

        if ( !SearchValidRoute(String(to.name), store.userData.user?.permissions)) {
            return { name: "not-authorized" };
        }
    }

    return true;
});

export default router;
