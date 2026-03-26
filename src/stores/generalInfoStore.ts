import { defineStore } from "pinia";
import { Api } from "@/api/connection.ts";
import { useMembersStore } from "@/stores/storeMembers.ts";
import type { InterfaceActivities, PaymentMethod } from "@/types/interfaceActivities.ts";
import type { InterfaceRates } from "@/types/InterfaceRates.ts";

export const storeChurches = defineStore("storeChurches", {
    state: () => ({
        churches: [] as { id: number, description: string, active: boolean }[]
    }),
    actions: {
        async getDataChurches() {
            const { response } = await Api.Get({ route: "church", params: { page_size: 666 } });
            if (response && response.status === 200) {
                this.churches = response.data.results;
            }
        }
    }
});

export const storeDocumentType = defineStore("storeDocumentType", {
    state: () => ({
        documentType: []
    }),
    actions: {
        async getDocumentType() {
            const { response } = await Api.Get({ route: "documentType", params: { page_size: 666 } });
            if (response && response.status === 200) {
                this.documentType = response.data.results;
            }
        }
    }
});

export const storePaymentMethod = defineStore("storePaymentMethod", {
    state: () => ({
        paymentMethod: [] as PaymentMethod[]
    }),
    actions: {
        async getPaymentMethod() {
            const { response } = await Api.Get({ route: "paymentMethod", params: { page_size: 666 } });
            if (response && response.status === 200) {
                this.paymentMethod = response.data.results;
            }
        }
    }
});

export const storeActivities = defineStore("storeActivities", {
    state: () => ({
        activities: [] as InterfaceActivities[]
    }),
    actions: {
        async getActivities() {
            const { response } = await Api.Get({ route: "activity" });
            if (response && response.status === 200) {
                this.activities = response.data;
            }
        }
    }
});

export const storeRate = defineStore("storeRate", {
    state: () => ({
        rate: [] as InterfaceRates[]
    }),
    actions: {
        async getRates() {
            const { response } = await Api.Get({ route: "tarifa", params: { page_size: 666 } });
            if (response && response.status === 200) {
                this.rate = response.data.results;
            }
        }
    }
});

export const storePriceRate = defineStore("storePriceRate", {
    state: () => ({
        totalPrice: 0
    }),
    actions: {
        calculateRate(): number {
            const dataRate = storeRate().rate.find(rt => rt.selected);
            const totalMembers = useMembersStore().membersData.length;
            if ( !dataRate) return 0;
            return this.totalPrice = parseFloat(dataRate.price) * totalMembers;
        }
    }
});

export const storeKind = defineStore("storeKind", {
    state: () => ({
        kinds: [] as { id: number, description: string, active: boolean }[]
    }),
    actions: {
        async getKinds() {
            const { response } = await Api.Get({ route: "kind" });
            if (response && response.status === 200) {
                this.kinds = response.data;
            }
        }
    }
});

export const storeActivityActive = defineStore("storeActivityActive", {
    state: () => ({
        showRatesActivity: false as boolean,
        activityId: null as number | null
    }),
    actions: {
        async getActiveActivity() {
            const activitiesStore = storeActivities();
            const useStoreActivities = activitiesStore.activities.find(
                act => act.is_active
            );

            this.showRatesActivity = useStoreActivities?.settings.inscription?.show_tarifas || false;
            this.activityId = useStoreActivities?.id || null;
        }
    }
});

export const storeUsers = defineStore("storeUsers", {
    state: () => ({
        users: [] as { id: number, username: string, first_name: string, last_name: string }[]
    }),
    actions: {
        async getUsers() {
            const { response } = await Api.Get({ route: "user", params: { page_size: 1000 } });
            if (response && response.status === 200) {
                this.users = response.data.results;
            }
        }
    }
});
