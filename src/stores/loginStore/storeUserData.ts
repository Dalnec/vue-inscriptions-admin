import { defineStore } from "pinia";
import useGlobalToast from "@/composables/toastEvent.ts";
import { type InterfaceLogin, type PermissionsInfo } from "@/types/InterfaceLogin.ts";
import router from "@/router";
import { useUserConsoleStore } from "@/stores/loginStore/storeUserDataConsole.ts";

export const useUserDataConfigStore = defineStore("userDataConfig", {
    state: () => ({
        userData: {} as InterfaceLogin
    }),
    actions: {
        async loginUserData(data: InterfaceLogin): Promise<void> {
            if ( !data.token) throw new Error("No access or refresh token");
            if ( !data.user) throw new Error("No user data");
            if (data.user?.id) this.userData = { ...data, user: { ...data.user } };

            useGlobalToast({ summary: `Bienvenido ${ this.userData.user?.username }` });
        },

        async logout(context: { isConsole: boolean; slug: string }) {
            this.userData = {} as InterfaceLogin;
            localStorage.removeItem("userDataConfig");
            sessionStorage.removeItem("userDataConfig");

            await useUserConsoleStore().logoutUserConsole(false);
            await router.push(`/${ context.slug }/login`);
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
            if (this.userData?.user?.is_staff) return true;
            return this.hasRoutePermission(routeName, permName, this.userData?.user?.permissions ?? []);
        }
    }
});
