import { createRouter, createWebHistory } from "vue-router";
import { useMembersStore } from "@/stores/storeMembers.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/", name: "home", redirect: { name: "newRegister" }, component: () => import("@/layout.vue"),
            children: [
                {
                    path: "/register", name: "newRegister", component: () => import("@/modules/registers/registersCard.vue"),
                    meta: { label: "Nueva Inscripción", icon: IconSolarClipboardAddBold }
                },
                {
                    path: "/pay-event", name: "payEvent", component: () => import("@/modules/registers/payEventView.vue"),
                    beforeEnter: async() => {
                        const membersStoreOptions = useMembersStore();
                        if (membersStoreOptions.membersData.length === 0) {
                            toastEvent({ severity: "error", summary: "Error al pagar", message: "Agregue una persona al menos" });
                            await router.push({ name: "newRegister" });
                            return;
                        }
                    }
                },
                {
                    path: "/inscriptions", name: "inscriptions", component: () => import("@/modules/inscriptions/inscriptions.vue"),
                    meta: {
                        label: "Inscripciones", icon: IconTablerClipboardDataFilled,
                        permissions: [
                            { name: "XD" }
                        ]
                    }
                },
                {
                    path: "/users", name: "users", component: () => import("@/modules/users/users.vue"),
                    meta: {
                        label: "Usuarios", icon: IconSolarUsersGroupRoundedBold,
                        superOnly: true,
                        permissions: [
                            { name: "XD2" }
                        ]
                    }
                },
                {
                    path: "/assistance", name: "assistance", component: () => import("../views/AboutView.vue"),
                    meta: {
                        label: "Asistencia", icon: IconMaterialSymbolsCalendarAppsScript,
                        permissions: [
                            { name: "XD3" }
                        ]
                    }
                }
            ]
        },
        { path: "/login", name: "login", component: () => import("@/pages/login.vue") },
        { path: "/:catchAll(.*)", name: "Page not found", redirect: "/" }
    ]
});

router.beforeEach(async(to, _, next) => {
    const useAuthStore = useUserDataConfigStore();

    // Usuario NO autenticado
    if ( !useAuthStore.userData?.token) {
        if (to.name !== "login") {
            return next({ name: "login" });
        }
        return next();
    }

    // Usuario autenticado y va al login → redirigir a home
    if (to.name === "login") {
        return next({ name: "home" });
    }

    // Usuario superusuario → acceso total
    if (useAuthStore.userData?.user?.profile_description === 'ADMINISTRADOR') {
        return next();
    }

    // Usuario no superusuario → permitir solo rutas específicas
    const allowedRoutes = [ "newRegister", "payEvent" ];
    if (allowedRoutes.includes(to.name as string)) {
        return next();
    }

    // Redirigir a home si no tiene permiso
    return next({ name: "home" });
});

export default router;
