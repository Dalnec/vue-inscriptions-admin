import router from "@/router";
import useGlobalToast from "@/composables/toastEvent.ts";
import { defineStore } from "pinia";
import { type InterfaceLogin, type PermissionsInfo } from "@/types/InterfaceLogin.ts";

export const useUserConsoleStore = defineStore("useUserConsoleStore", {
    state: () => ({
        userInfo: {} as InterfaceLogin
    }),
    actions: {
        async loginUserData(data: InterfaceLogin): Promise<void> {
            if ( !data.token) throw new Error("No access or refresh token");
            if ( !data.user) throw new Error("No user data");
            if (data.user?.id) this.userInfo = { ...data, user: { ...data.user } };

            useGlobalToast({ summary: `Bienvenido ${ this.userInfo.user?.username }` });
        },

        async logout(context?: { isConsole?: boolean; slug?: string }) {
            this.userInfo = {} as InterfaceLogin;
            localStorage.clear();
            sessionStorage.clear();

            if (context?.isConsole) {
                await router.push("/console/login");
            } else if (context?.slug) {
                await router.push(`/${ context.slug }/login`);
            } else {
                await router.push("/");
            }
        },
        hasRoutePermission(routeName: string, permName: string, routes: PermissionsInfo[] = []): boolean {
            const perm = permName.trim().toLowerCase();

            return routes.some(route => {
                if (route.name === routeName) {
                    const routePerms: string[] = route.meta?.permissions ?? route.permissions ?? [];
                    return routePerms.some(p => p.trim().toLowerCase() === perm);
                }
                return route.children ? this.hasRoutePermission(routeName, permName, route.children) : false;
            });
        },

        SearchPermission(routeName: string, permName: string): boolean {
            if (this.userInfo?.user?.is_staff) return true;
            return this.hasRoutePermission(routeName, permName, this.userInfo?.user?.permissions ?? []);
        }
    }
});
