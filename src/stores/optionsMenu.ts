import router from "@/router/index";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import { defineStore } from "pinia";
import SearchValidRoute from "@/composables/searchRouteValid.ts";
import type { RouteRecordRaw } from "vue-router";
import { useEventSlugStore } from "@/stores/eventSlug.ts";
import { useUserConsoleStore } from "@/stores/loginStore/storeUserDataConsole.ts";

interface RouteMeta {
    icon?: string;
    label?: string;
}

interface Option {
    active: string;
    expand?: boolean;
    icon?: string;
    items?: Option[];
    key: string;
    label?: string;
    meta: RouteMeta;
    path?: string;
    route?: string;
    visible: boolean;
}

export const navBarStore = defineStore("optionsMenu", {
    state: () => ({ options: [] as Option[] }),
    actions: {
        /**
         * Creates the option menu by resolving router views and processing the routes.
         * This method retrieves the child routes of the "home" route, if available,
         * and generates options from the resolved routes.
         *
         * @return {Promise<void>} A promise that resolves once the option menu has been created.
         */
        async createOptionsMenu(): Promise<void> {
            const route = router.currentRoute.value;
            const isConsole = route.path.startsWith("/console");
            const targetRouteName = isConsole ? "console-home" : "home";

            const resolved = router.resolve({ name: targetRouteName });
            const matched = resolved.matched;

            if ( !matched?.length) {
                this.options = [];
                return;
            }

            // 🔹 Buscar la ruta exacta por name
            const routeWithChildren = matched.find(r => r.name === targetRouteName);

            if ( !routeWithChildren || !routeWithChildren.children?.length) {
                this.options = [];
                return;
            }

            this.options = this.processRoutes(routeWithChildren.children);
        },
        /**
         * Determines if the given path contains any required parameters.
         *
         * @param {string} path - The input path string that may contain parameters.
         * @return {boolean} Returns true if there are required parameters in the path, otherwise false.
         */
        hasRequiredParams(path: string): boolean {
            const matches = [ ...path.matchAll(/:(\w+)(\?)?/g) ];
            return matches.some(([ , , optional ]) => !optional);
        },
        /**
         * Processes an array of route records to extract specific options based on route metadata.
         *
         * @param {RouteRecordRaw[]} routes - An array of route record objects to be processed.
         * @return {Option[]} An array of processed options derived from the provided route records.
         */
        processRoutes(routes: RouteRecordRaw[]): Option[] {
            return routes.reduce((processedRoutes: Option[], route: RouteRecordRaw) => {
                if (route.meta && "label" in route.meta) {
                    const processedRoute: Option | null = this.valuesRoutesMenu(route);

                    if (processedRoute) {
                        processedRoutes.push(processedRoute);
                        if (route.meta?.separator) {
                            processedRoutes.push({ separator: true } as unknown as Option);
                        }
                    }
                }
                return processedRoutes;
            }, []);
        },
        /**
         * Processes a route record and generates an option object for a route menu.
         *
         * @param {RouteRecordRaw} route - The route record to process, which contains metadata, path, name, and children.
         * @return {Option | null} Returns an Option object if the route can be included in the menu,
         * or null if the route is not valid for the menu.
         */
        valuesRoutesMenu(route: RouteRecordRaw): Option | null {
            const eventStore = useUserDataConfigStore();
            const consoleStore = useUserConsoleStore();
            const slugStore = useEventSlugStore();
            const slug = slugStore.slug;

            if ( !route.name || !router.hasRoute(route.name)) return null;

            if ( !(route.meta && "label" in route.meta)) return null;
            const meta = route.meta as RouteMeta;

            const objOption: Option = {
                label: meta.label,
                key: route.name as string,
                active: route.name as string,
                icon: meta.icon,
                visible: true,
                meta
            };

            const isDynamic = route.path.includes(":");
            const hasRequired = this.hasRequiredParams(route.path);

            // =========================
            // PARAMS BASE SEGÚN SESIÓN
            // =========================
            const isConsole = !!consoleStore.userInfo?.token && !!consoleStore.userInfo?.user;
            const baseParams = !isConsole && slug ? { slug } : {};

            // =========================
            // RESOLUCIÓN DE RUTA
            // =========================
            if ( !isDynamic || !hasRequired) {
                const resolved = router.resolve({ name: route.name as string, params: baseParams });
                objOption.route = resolved.fullPath;
                objOption.path = resolved.path;
            } else {
                return null;
            }

            // =========================
            // CHILDREN
            // =========================
            if (route.children && !route?.meta?.isNotMenu) {
                objOption.items = this.processRoutes(route.children);
                objOption.expand = false;
                return objOption; // aunque items esté vacío, devolvemos el padre
            }

            // =========================
            // PERMISOS
            // =========================
            if (isConsole) return objOption; // console tiene acceso total

            if (eventStore.userData.user?.is_staff) return objOption;

            const existOption = SearchValidRoute(objOption.key, eventStore.userData.user?.permissions);
            return existOption ? objOption : null;
        }
    }
});
