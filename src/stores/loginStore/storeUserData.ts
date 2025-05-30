import { defineStore } from "pinia";
import { type InterfaceLogin } from "@/types/InterfaceLogin.ts";
import router from "@/router/index";

export const useUserDataConfigStore = defineStore("userDataConfig", {
    state: () => ({
        userData: {} as InterfaceLogin
    }),
    actions: {
        async loginUserData(data: InterfaceLogin) {
            this.userData = { ...data };
            await router.push({ name: "home", force: true });
        },
        async logout() {
            this.userData = {} as InterfaceLogin;
            localStorage.clear();
            sessionStorage.clear();
            await router.push({ name: "login", force: true });
        }
    }
});
