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
            children: [
                {
                    component: () => import("@/modules/registers/registersCard.vue"),
                    meta: { icon: IconMaterialSymbolsAddNotesOutline, label: "Nueva Inscripción" }, name: "newRegister",
                    path: "register"
                },
                {
                    beforeEnter: async() => {
                        const membersStoreOptions = useMembersStorePage();
                        if (membersStoreOptions.membersData.length === 0) {
                            toastEvent({ severity: "warn", summary: "Error al pagar", detail: "Agregue una persona al menos" });
                            await router.push({ name: "newRegister" });
                            return;
                        }
                    }, component: () => import("@/modules/registers/payEventView.vue"), name: "payEvent",
                    path: "pay-event"
                },
                {
                    component: () => import("@/modules/inscriptions/inscriptions.vue"), meta: {
                        icon: IconMaterialSymbolsFrameInspectRounded, label: "Inscripciones",
                        permissions: [
                            { name: "Permiso 1" },
                            { name: "Permiso 2" },
                            { name: "Permiso 3" },
                            { name: "Permiso 4" },
                            { name: "Permiso 5" }
                        ]
                    }, name: "inscriptions",
                    path: "inscriptions"
                },
                {
                    component: () => import("@/modules/users/users.vue"), meta: {
                        icon: IconMaterialSymbolsGroupOutlineRounded, label: "Usuarios"
                    }, name: "users",
                    path: "users"
                },
                {
                    component: () => import("@/modules/caja/caja.vue"), meta: {
                        icon: IconMaterialSymbolsAccountBalanceWalletOutline, label: "Caja"
                    }, name: "caja",
                    path: "caja"
                },
                {
                    component: () => import("@/modules/settings/index.vue"), meta: {
                        icon: IconMaterialSymbolsCalendarAppsScript, label: "Configuraciones"
                    },
                    name: "settings",
                    path: "settings"
                },
                {
                    component: () => import("@/modules/tillConcept/TillConcepts.vue"), name: "conceptsCaja", path: "concepts-caja"
                },
                {
                    component: () => import("@/modules/settings/eventManage.vue"), name: "event", path: "event"
                },
                {
                    component: () => import("@/modules/settings/concepts.vue"), name: "concepts", path: "concepts"
                },
                {
                    component: () => import("@/modules/activities/activities.vue"), meta: {
                        icon: IconMaterialSymbolsEventNoteOutline, label: "Actividades"
                    }, name: "activities",
                    path: "activities"
                }
            ], component: () => import("@/layout.vue"), name: "home", path: "/home",
            redirect: { name: "newRegister" }
        },
        {
            path: "/",
            name: "webHome",
            component: () => import("@/components/app/stillWorking.vue"),
            meta: { public: true }
        },
        {
            beforeEnter: (to) => {
                const validSlugs = [ "camp2026" ];

                const slug = String(to.params.slug);

                if ( !validSlugs.includes(slug)) {
                    return { name: "webHome" };
                }

                return true;
            },
            component: () => import("@/pages/public/webEvent/HomePage.vue"),
            meta: { public: true },
            name: "webPage",

            path: "/:slug"
        },
        {
            component: () => import("@/pages/public/registerMembers/RegisterMemberEvent.vue"),
            meta: { public: true },
            name: "inscription-members",
            path: "/inscribete"
        },
        {
            beforeEnter: async() => {
                const membersStoreOptions = useMembersStore();
                if (membersStoreOptions.membersData.length === 0) {
                    toastEvent({ severity: "warn", summary: "Error al pagar", detail: "Agregue una persona al menos" });
                    await router.push({ name: "newRegister" });
                    return;
                }
            },
            component: () => import("@/pages/public/registerMembers/FormPayMembers.vue"),
            meta: { public: true },
            name: "pay-inscription-members",
            path: "/pagar"
        },
        { path: "/view-event", name: "viewEvent", component: () => import("@/pages/login.vue"), meta: { public: true } },
        { path: "/:pathMatch(.*)*", name: "Page not found", redirect: "/" }
    ]
});

router.beforeEach((to) => {
    const store = useUserDataConfigStore();

    const isAuth = !!store.userData.token;
    const isStaff = store.userData.user?.is_staff;
    const isPublic = to.meta?.public === true;

    const isHomeRoute = to.matched.some(r => r.path === "/home");

    if (isPublic) {
        return true;
    }

    if (isHomeRoute && !isAuth) {
        return { name: "login" };
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
