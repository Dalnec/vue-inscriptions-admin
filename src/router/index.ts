import { createRouter, createWebHistory } from "vue-router";
import { useMembersStore } from "@/stores/storeMembers.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useMembersStorePage } from "@/stores/StoreMembersPage.ts";
import SearchValidRoute from "@/composables/searchRouteValid.ts";
import { useEventSlugStore } from "@/stores/eventSlug.ts";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // =========================
        // HOME (LEGACY - NO TOCAR)
        // =========================
        {
            children: [
                {
                    component: () => import("@/modules/registers/registersCard.vue"),
                    meta: { icon: IconMaterialSymbolsAddNotesOutline, label: "Nueva Inscripción" },
                    name: "newRegister",
                    path: "register"
                },
                {
                    beforeEnter: async() => {
                        const membersStoreOptions = useMembersStorePage();
                        if (membersStoreOptions.membersData.length === 0) {
                            toastEvent({
                                severity: "warn",
                                summary: "Error al pagar",
                                detail: "Agregue una persona al menos"
                            });
                            return { name: "newRegister" };
                        }
                    },
                    component: () => import("@/modules/registers/payEventView.vue"),
                    name: "payEvent",
                    path: "pay-event"
                },
                {
                    component: () => import("@/modules/inscriptions/inscriptions.vue"),
                    meta: {
                        icon: IconMaterialSymbolsFrameInspectRounded,
                        label: "Inscripciones",
                        permissions: [
                            { name: "Permiso 1" },
                            { name: "Permiso 2" },
                            { name: "Permiso 3" },
                            { name: "Permiso 4" },
                            { name: "Permiso 5" }
                        ]
                    },
                    name: "inscriptions",
                    path: "inscriptions"
                },
                {
                    component: () => import("@/modules/users/users.vue"),
                    meta: { icon: IconMaterialSymbolsGroupOutlineRounded, label: "Usuarios" },
                    name: "users",
                    path: "users"
                },
                {
                    component: () => import("@/modules/caja/caja.vue"),
                    meta: { icon: IconMaterialSymbolsAccountBalanceWalletOutline, label: "Caja" },
                    name: "caja",
                    path: "caja"
                },
                {
                    component: () => import("@/modules/settings/index.vue"),
                    meta: { icon: IconMaterialSymbolsCalendarAppsScript, label: "Configuraciones" },
                    name: "settings",
                    path: "settings"
                },
                {
                    component: () => import("@/modules/tillConcept/TillConcepts.vue"),
                    name: "conceptsCaja",
                    path: "concepts-caja"
                },
                {
                    component: () => import("@/modules/settings/eventManage.vue"),
                    name: "event",
                    path: "event"
                },
                {
                    component: () => import("@/modules/settings/concepts.vue"),
                    name: "concepts",
                    path: "concepts"
                },
                {
                    component: () => import("@/modules/activities/activities.vue"),
                    meta: {
                        icon: IconMaterialSymbolsEventNoteOutline,
                        label: "Actividades"
                    },
                    name: "activities",
                    path: "activities"
                }
            ],
            component: () => import("@/layout.vue"),
            name: "home",
            path: "/home",
            redirect: { name: "newRegister" }
        },

        // =========================
        // HOME POR EVENTO (NUEVO)
        // =========================
        {
            path: "/:slug/home",
            component: () => import("@/layout.vue"),
            name: "event-home",

            beforeEnter: (to) => {
                const validSlugs = [ "camp2026" ];
                const slug = String(to.params.slug);

                if ( !validSlugs.includes(slug)) {
                    return { name: "webHome" };
                }

                return true;
            },

            redirect: (to) => ({
                name: "event-newRegister",
                params: { slug: to.params.slug }
            }),

            children: [
                {
                    path: "register",
                    name: "event-newRegister",
                    component: () => import("@/modules/registers/registersCard.vue")
                },
                {
                    path: "pay-event",
                    name: "event-payEvent",
                    component: () => import("@/modules/registers/payEventView.vue"),
                    beforeEnter: async(to) => {
                        const store = useMembersStorePage();

                        if (store.membersData.length === 0) {
                            toastEvent({
                                severity: "warn",
                                summary: "Error al pagar",
                                detail: "Agregue una persona al menos"
                            });

                            return {
                                name: "event-newRegister",
                                params: { slug: to.params.slug }
                            };
                        }
                    }
                }
            ]
        },

        // =========================
        // PUBLICO
        // =========================
        {
            path: "/",
            name: "webHome",
            component: () => import("@/components/app/stillWorking.vue"),
            meta: { public: true }
        },

        {
            path: "/:slug",
            component: () => import("@/components/app/EventLayout.vue"),
            meta: { public: true },

            beforeEnter: (to) => {
                const validSlugs = [ "camp2026" ];
                const slug = String(to.params.slug);

                if ( !validSlugs.includes(slug)) {
                    return { name: "webHome" };
                }

                return true;
            },

            children: [
                {
                    path: "",
                    name: "webPage",
                    component: () => import("@/pages/public/webEvent/HomePage.vue")
                },
                {
                    path: "login",
                    name: "event-login",
                    component: () => import("@/pages/login.vue"),
                    meta: { public: true }
                },
                {
                    path: "inscribete",
                    name: "event-inscription",
                    component: () => import("@/pages/public/registerMembers/RegisterMemberEvent.vue"),
                    meta: { public: true }
                },
                {
                    path: "pagar",
                    name: "event-pay",
                    component: () => import("@/pages/public/registerMembers/FormPayMembers.vue"),
                    meta: { public: true }
                }
            ]
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
                    toastEvent({
                        severity: "warn",
                        summary: "Error al pagar",
                        detail: "Agregue una persona al menos"
                    });
                    return { name: "newRegister" };
                }
            },
            component: () => import("@/pages/public/registerMembers/FormPayMembers.vue"),
            meta: { public: true },
            name: "pay-inscription-members",
            path: "/pagar"
        },

        {
            component: () => import("@/pages/login.vue"),
            meta: { public: true },
            name: "viewEvent",
            path: "/view-event"
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: "/"
        }
    ]
});

// =========================
// GLOBAL GUARD (SIN CAMBIOS)
/// =========================
router.beforeEach((to) => {
    const store = useUserDataConfigStore();

    const isAuth = !!store.userData.token;
    const isStaff = store.userData.user?.is_staff;
    const isPublic = to.meta?.public === true;

    const isHomeRoute = to.matched.some(r => r.path === "/home");

    const slugStore = useEventSlugStore();

    if (to.params.slug) {
        slugStore.setSlug(String(to.params.slug));
    }

    const slug = slugStore.slug;

    if (slug) {
        const alreadyHasSlug = to.path === `/${ slug }` || to.path.startsWith(`/${ slug }/`);
        if ( !alreadyHasSlug) {
            return {
                path: `/${ slug }${ to.path }`,
                query: to.query,
                hash: to.hash,
                replace: true
            };
        }
    }

    if (isPublic) return true;

    if (isHomeRoute && !isAuth) {
        const slug = to.params.slug;

        if (slug) {
            return { name: "event-login", params: { slug } };
        }

        return { name: "login" };
    }

    if (isAuth && (to.name === "login" || to.name === "event-login")) {
        const slug = to.params.slug;

        if (slug) {
            return { name: "event-home", params: { slug } };
        }

        return { name: "home" };
    }

    if (isAuth) {
        if (isStaff) return true;

        if ( !SearchValidRoute(String(to.name), store.userData.user?.permissions)) {
            return { name: "not-authorized" };
        }
    }

    return true;
});

export default router;
