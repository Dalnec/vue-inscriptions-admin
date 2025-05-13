import { defineStore } from "pinia";
import { Api } from "@/api/connection.ts";
import { useMembersStore } from "@/stores/storeMembers.ts";
import type { InterfaceActivities, PaymentMethod } from "@/stores/interfaceActivities.ts";

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
        rate: [] as { id: number, created: string, modified: string, description: string, price: string, active: boolean, selected: boolean }[]
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
        calculateRate(priceActivity: number): number {
            const totalMembers = useMembersStore().membersData.length;
            if ( !priceActivity) return 0;
            return this.totalPrice = priceActivity * totalMembers;
        }
    }
});

export const storeKind = defineStore("storeKind", {
    state: () => ({
        kind: [] as { id: number, description: string, active: boolean }[]
    }),
    actions: {
        async getKinds() {
            const { response } = await Api.Get({ route: "kind" });
            if (response && response.status === 200) {
                this.kind = response.data;
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
