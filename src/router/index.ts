import { Api } from "@/api/connection.ts";
import { useMembersStore } from "@/stores/storeMembers.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { useMembersStorePage } from "@/stores/StoreMembersPage.ts";
import { useEventSlugStore } from "@/stores/eventSlug.ts";
import { useUserConsoleStore } from "@/stores/loginStore/storeUserDataConsole.ts";
import { createRouter, createWebHistory } from "vue-router";
import SearchValidRoute from "@/composables/searchRouteValid.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { setFavicon } from "@/composables/useFavicon.ts";
import { setMetaTags } from "@/composables/useMetaTags.ts";
import logoRegis from "@/assets/images/LogoRegis.png";
import eventsCalendar from "@/assets/images/EventsCalendar.png";

const validatedSlugs = new Set<string>();

const validateSlug = async(slug: string) => {
    if (validatedSlugs.has(slug)) return true;

    try {
        const { response } = await Api.Get({
            route: "activity",
            params: { shortname: slug }
        });

        const isValid = response?.status === 200 && response.data.length > 0;

        if (isValid) validatedSlugs.add(slug);

        return isValid;
    } catch {
        return false;
    }
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, _from, savedPosition) {
        if (to.hash) {
            return { el: to.hash, behavior: "smooth", top: 80 };
        }
        if (savedPosition) return savedPosition;
        return { top: 0 };
    },
    routes: [
        {
            path: "/",
            name: "webHome",
            component: () => import("@/pages/public/homeEvents/HomePage.vue"),
            meta: { public: true }
        },
        {
            path: "/console",
            name: "console",
            redirect: "/console/login",
            meta: { console: true },
            children: [
                {
                    path: "/console/login",
                    name: "console-login",
                    component: () => import("@/pages/login.vue"),
                    meta: { public: true }
                },
                {
                    path: "home",
                    name: "console-home",
                    component: () => import("@/console/ConsoleHome.vue"),
                    children: [
                        {
                            component: () => import("@/console/dashboard/DashboardView.vue"),
                            meta: { icon: IconMaterialSymbolsBarChart4BarsRounded, label: "Dashboard" },
                            name: "console-dashboard",
                            path: "dashboard"
                        },
                        {
                            component: () => import("@/console/events/ManageEvents.vue"),
                            meta: { icon: IconMaterialSymbolsEventAvailableOutlineRounded, label: "Eventos" },
                            name: "console-events",
                            path: "events/:id?"
                        },
                        {
                            component: () => import("@/modules/activities/activities.vue"),
                            meta: {
                                icon: IconMaterialSymbolsEventNoteOutline,
                                label: "Lista de eventos"
                            },
                            name: "console-events-list",
                            path: "events-list"
                        },
                        {
                            component: () => import("@/modules/users/users.vue"),
                            meta: { icon: IconMaterialSymbolsGroupOutlineRounded, label: "Usuarios" },
                            name: "console-users",
                            path: "users"
                        },
                        {
                            component: () => import("@/modules/caja/caja.vue"),
                            meta: { icon: IconMaterialSymbolsAccountBalanceWalletOutline, label: "Caja" },
                            name: "console-caja",
                            path: "caja"
                        },
                        {
                            component: () => import("@/modules/settings/index.vue"),
                            meta: { icon: IconMaterialSymbolsCalendarAppsScript, label: "Configuraciones" },
                            name: "console-settings",
                            path: "settings"
                        },
                        {
                            component: () => import("@/modules/tillConcept/TillConcepts.vue"),
                            name: "console-conceptsCaja",
                            path: "concepts-caja"
                        },
                        {
                            component: () => import("@/modules/settings/concepts.vue"),
                            name: "console-concepts",
                            path: "concepts"
                        }
                    ]
                }
            ]
        },
        {
            path: "/:slug?",
            component: () => import("@/components/app/EventLayout.vue"),
            meta: { public: true },

            beforeEnter: async(to) => {
                const slug = String(to.params.slug || "");
                const consoleStore = useUserConsoleStore();

                const isConsoleRoute = to.path.startsWith("/console");
                const isAuthConsole =
                    !!consoleStore.userInfo?.token &&
                    !!consoleStore.userInfo?.user &&
                    Object.keys(consoleStore.userInfo.user).length > 0;

                // 🔹 Rutas console → solo validar sesión console
                if (isConsoleRoute) {
                    if ( !isAuthConsole) return { name: "console-login" };
                    return true;
                }

                // 🔹 Rutas de evento → validar slug siempre
                if (slug) {
                    const isValid = await validateSlug(slug);
                    if ( !isValid) return { name: "not-found" };
                    return true;
                }

                // 🔹 fallback
                return true;
            },
            children: [
                {
                    path: "",
                    name: "webPage",
                    component: () => import("@/pages/public/webEvent/index.vue")
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

        {
            path: "/:slug?/home",
            meta: { allowConsoleAccess: true },
            component: () => import("@/layout.vue"),
            name: "home",
            beforeEnter: async(to) => {

                const slug = String(to.params.slug);

                if ([ "console" ].includes(slug)) return true;

                const isValid = await validateSlug(slug);

                if ( !isValid) {
                    return { name: "not-found" };
                }

                return true;
            },
            // redirect: { name: "newRegister" },

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
                }
            ]
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("@/components/NotFound.vue")
        }
    ]
});

router.beforeEach(async(to) => {
    const consoleStore = useUserConsoleStore();
    const eventStore = useUserDataConfigStore();
    const slugStore = useEventSlugStore();

    const slug = to.params.slug as string | undefined;
    const isConsoleRoute = to.path.startsWith("/console");
    const isPublicRoute = to.meta?.public === true;

    // Validación adicional para rutas no permitidas
    if (to.path === "/login") {
        return { name: "not-found" };
    }

    const isAuthConsole =
        !!consoleStore.userInfo?.token &&
        !!consoleStore.userInfo?.user &&
        Object.keys(consoleStore.userInfo.user).length > 0;

    const isAuthEvent =
        !!eventStore.userData?.token &&
        !!eventStore.userData?.user &&
        Object.keys(eventStore.userData.user).length > 0;

    const isErrorRoute = [ "not-found", "event-not-found" ].includes(String(to.name));

    // -------------------------
    // 0. PRIORIDAD: si hay sesión console
    // -------------------------
    if (isAuthConsole && slug) {
        slugStore.setSlug(slug);

        // si intenta entrar a login del evento → redirigir al inicio de configuración del evento
        if (to.name === "event-login") {
            return { name: "newRegister", params: { slug } };
        }

        // cualquier otra ruta del evento → permitir acceso
        if (!isConsoleRoute) return true;
    }

    // -------------------------
    // 1. Rutas públicas
    // -------------------------
    if (isPublicRoute) {
        if (to.name === "console-login" && isAuthConsole) return { name: "console-users" };
        if (to.name === "event-login" && isAuthEvent && slug) return { name: "newRegister", params: { slug } };
        return true;
    }

    // -------------------------
    // 2. Rutas de console
    // -------------------------
    if (isConsoleRoute) {
        if ( !isAuthConsole) return { name: "console-login" };
        if (to.name === "console-login") return { name: "console-users" };

        const user = consoleStore.userInfo.user;
        if ( !user?.is_staff) {
            const allowed = SearchValidRoute(String(to.name), user?.permissions);
            if ( !allowed) return { name: "not-authorized" };
        }
        return true;
    }

    // -------------------------
    // 3. Rutas de evento /:slug/*
    // -------------------------
    if (slug && !isErrorRoute) {
        slugStore.setSlug(slug);

        // validar slug solo si no hay sesión console
        const validSlug = await validateSlug(slug);
        if ( !validSlug) return { name: "not-found", replace: true };

        // sesión de evento → permitir acceso a rutas del evento
        if (isAuthEvent) {
            return true;
        }

        // sin sesión → login de evento
        return { name: "event-login", params: { slug }, replace: true };
    }

    // -------------------------
    // 4. Resto de rutas
    // -------------------------
    return true;
});

// ─── Caché de logos por slug para evitar llamadas repetidas ───
const slugLogoCache = new Map<string, string>();

router.afterEach(async (to) => {
    const slug = to.params.slug as string | undefined;
    const isConsoleRoute = to.path.startsWith("/console");

    if (isConsoleRoute) {
        document.title = "Regis | Panel administrativo";
        setFavicon(logoRegis);
        setMetaTags({ title: "Regis | Panel administrativo" });
    } else if (slug) {
        document.title = slug;

        // Si ya tenemos el logo cacheado, usarlo de inmediato
        if (slugLogoCache.has(slug)) {
            setFavicon(slugLogoCache.get(slug)!);
        } else {
            // Obtener el logo del evento desde la API
            try {
                const { response } = await Api.Get({ route: "activity", params: { shortname: slug } });
                if (response?.status === 200 && response.data[0]) {
                    const info = response.data[0];
                    document.title = info.shortname || info.title;
                    setMetaTags({
                        title: info.title || info.shortname,
                        description: info.description,
                        image: info.logo || undefined,
                        url: window.location.href
                    });
                    if (info.logo) {
                        slugLogoCache.set(slug, info.logo);
                        setFavicon(info.logo);
                    }
                }
            } catch { /* silencioso */ }
        }
    } else {
        document.title = "Eventos disponibles";
        setFavicon(eventsCalendar);
        setMetaTags({ title: "Eventos disponibles" });
    }
});

export default router;
