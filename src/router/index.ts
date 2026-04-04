import { createRouter, createWebHistory } from "vue-router";
import SearchValidRoute from "@/composables/searchRouteValid.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { useMembersStore } from "@/stores/storeMembers.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useMembersStorePage } from "@/stores/StoreMembersPage.ts";
import { useEventSlugStore } from "@/stores/eventSlug.ts";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // =========================
        // LANDING GLOBAL (SIN SLUG)
        // =========================
        {
            path: "/",
            name: "webHome",
            component: () => import("@/pages/public/homeEvents/HomePage.vue"),
            meta: { public: true }
        },

        // =========================
        // EVENTO (PÚBLICO)
        // =========================
        {
            path: "/:slug",
            component: () => import("@/components/app/EventLayout.vue"),
            meta: { public: true },

            beforeEnter: (to) => {
                const validSlugs = [ "camp2026" ];
                const slug = String(to.params.slug);

                if ( !validSlugs.includes(slug)) {
                    return { name: "not-found" };
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
                    path: "inscribirse",
                    name: "event-inscription",
                    component: () => import("@/pages/public/registerMembers/RegisterMemberEvent.vue"),
                    meta: { public: true }
                },
                {
                    path: "pagar",
                    name: "event-pay",
                    component: () => import("@/pages/public/registerMembers/FormPayMembers.vue"),
                    meta: { public: true },
                    beforeEnter: async(to) => {
                        const store = useMembersStore();

                        if (store.membersData.length === 0) {
                            toastEvent({
                                severity: "warn",
                                summary: "Error al pagar",
                                detail: "Agregue una persona al menos"
                            });

                            return {
                                name: "event-inscription",
                                params: { slug: to.params.slug }
                            };
                        }
                    }
                },

                // 404 EVENTO
                {
                    path: ":pathMatch(.*)*",
                    name: "event-not-found",
                    component: () => import("@/components/NotFound.vue")
                }
            ]
        },

        // =========================
        // PANEL PRIVADO
        // =========================
        {
            path: "/:slug/home",
            component: () => import("@/layout.vue"),
            name: "home",

            beforeEnter: (to) => {
                const validSlugs = [ "camp2026" ];
                const slug = String(to.params.slug);

                if ( !validSlugs.includes(slug)) {
                    return { name: "not-found" };
                }

                return true;
            },

            redirect: { name: "newRegister" },

            children: [
                {
                    path: "register",
                    name: "newRegister",
                    component: () => import("@/modules/registers/registersCard.vue"),
                    meta: {
                        icon: IconMaterialSymbolsAddNotesOutline,
                        label: "Nueva Inscripción"
                    }
                },
                {
                    path: "pay-event",
                    name: "payEvent",
                    component: () => import("@/modules/registers/payEventView.vue"),
                    beforeEnter: async(to) => {
                        const store = useMembersStorePage();
                        console.log(store.membersData);
                        if (store.membersData.length === 0) {
                            return {
                                name: "newRegister",
                                params: { slug: to.params.slug }
                            };
                        }
                        return true;
                    }
                },
                {
                    path: "inscriptions",
                    name: "inscriptions",
                    component: () => import("@/modules/inscriptions/inscriptions.vue"),
                    meta: {
                        icon: IconMaterialSymbolsFrameInspectRounded,
                        label: "Inscripciones"
                    }
                },
                {
                    meta: { icon: IconMaterialSymbolsGroupOutlineRounded, label: "Usuarios" },
                    path: "users",
                    name: "users",
                    component: () => import("@/modules/users/users.vue")
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
            ]
        },
        // =========================
        // 404 GLOBAL
        // =========================
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("@/components/NotFound.vue")
        }
    ]
});

// =========================
// GLOBAL GUARD (SIN CAMBIOS)
/// =========================
router.beforeEach((to) => {
    const store = useUserDataConfigStore();
    const slugStore = useEventSlugStore();

    const isAuth = !!store.userData.token;
    const isStaff = store.userData.user?.is_staff;
    const isPublic = to.meta?.public === true;

    // =========================
    // SYNC SLUG
    // =========================
    if (to.params.slug) {
        slugStore.setSlug(String(to.params.slug));
    }

    const slug = slugStore.slug;

    // =========================
    // INYECTAR SLUG (si falta)
    // =========================
    if (slug) {
        const alreadyHasSlug = to.path.startsWith(`/${ slug }`);
        const isCatchAll = to.matched.some(r => r.path.includes(":pathMatch"));
        const isNotFound = [ "not-found", "event-not-found" ].includes(String(to.name));
        const isRoot = to.path === "/";

        if ( !alreadyHasSlug && !isCatchAll && !isNotFound && !isRoot) {
            return {
                path: `/${ slug }${ to.path }`,
                query: to.query,
                hash: to.hash,
                replace: true
            };
        }
    }

    // =========================
    // REDIRECT LOGIN SI YA ESTÁ LOGUEADO
    // =========================
    if (isAuth && (to.name === "login" || to.name === "event-login")) {
        return {
            name: "home",
            params: { slug }
        };
    }

    // =========================
    // RUTAS PUBLICAS
    // =========================
    if (isPublic) return true;

    // =========================
    // BLOQUEO SI NO AUTH EN /home
    // =========================
    const isHomeRoute = to.path.includes("/home");

    if (isHomeRoute && !isAuth) {
        return {
            name: "event-login",
            params: { slug }
        };
    }

    // =========================
    // PERMISOS
    // =========================
    if (isAuth) {
        if (isStaff) return true;

        if ( !SearchValidRoute(String(to.name), store.userData.user?.permissions)) {
            return { name: "not-authorized" };
        }
    }

    return true;
});

export default router;
