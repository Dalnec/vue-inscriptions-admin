<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { storeActivities, storePaymentMethod, storePriceRate, storeRate } from "@/stores/generalInfoStore.ts";
import { useMembersStore } from "@/stores/storeMembers.ts";
import { computed, ref, onMounted } from "vue";
import { useField, useForm } from "vee-validate";
import { fileToBase64 } from "@/composables/convertImageToUpload.ts";
import { useRoute } from "vue-router";
import toastEvent from "@/composables/toastEvent.ts";
import router from "@/router/index";
import * as yup from "yup";
import type { FileUploadSelectEvent } from "primevue";
import type { PaymentMethod } from "@/types/interfaceActivities.ts";
import DrawerMembersSaved from "@/components/drawerMembersSaved.vue";
import ViewPaymentMethods from "@/components/viewPaymentMethods.vue";

type VoucherImageType = { file: File; objectURL: string; };
const route = useRoute();

const refDrawerMembersSaved = ref();
const loadingSave = ref(false);
const updateVisibilityDrawer = () => refDrawerMembersSaved.value.visibleDrawer = true;
const storeDataMembers = useMembersStore();
const fileAccept = ref<string>("image/png, image/jpeg, image/jpg");
const refVoucherImage = ref();
const dataForViewPayment = ref<Partial<PaymentMethod>>({ account: "", active: true, cci: null, description: "", icon: "", id: null });
const usePaymentMethodStore = storePaymentMethod();
const useStoreTotalRate = storePriceRate();
const useStoreActivities = storeActivities();
const useStoreRates = storeRate();

const validationSchema = ref(yup.object({
    paymentmethod: yup.number().required("Seleccione el método de pago"),
    voucherfile: yup.object().shape({
        file: yup.mixed().required("Img. requerida"), objectURL: yup.string().required("Img. requerida")
    }).nullable()
}));

const { handleSubmit, errors, resetForm } = useForm<{ voucherfile: VoucherImageType | {}, paymentmethod: null | number, tarifa: number }>({
    validationSchema, initialValues: { voucherfile: {}, paymentmethod: null }
});

const { value: voucherfile, setValue: setVoucherImage } = useField<VoucherImageType | {}>("voucherfile");
const { value: paymentmethod } = useField<number | null>("paymentmethod");
const { value: tarifa, setValue: setRate } = useField<number | null>("tarifa");

const setVoucherImageFile = (file: File | null) => {
    if (file) voucherfile.value = { file, objectURL: URL.createObjectURL(file) };
    else voucherfile.value = {};
};

function isVoucherImage(obj: unknown): obj is VoucherImageType {
    return (typeof obj === "object" && obj !== null && "file" in obj && obj.file instanceof File && "objectURL" in obj && typeof obj.objectURL === "string");
}

const saveAllMembers = handleSubmit(async() => {
    try {

        loadingSave.value = true;
        const dataActivity = useStoreActivities.activities.find(act => act.is_active);
        const payload: Record<string, any> = {
            activity: dataActivity?.id,
            paymentmethod: paymentmethod.value,
            people: storeDataMembers.membersData.map(member => ({
                ...member,
                status: true
            })),
            tarifa: tarifa.value,
            voucheramount: useStoreTotalRate.calculateRate(false)
        };
        if (isVoucherImage(voucherfile.value)) payload.voucherfile = await fileToBase64(voucherfile.value.file);

        const { response } = await Api.Post({ route: "inscription-groups/register-group", data: payload });

        if (response && response?.status === 201) {
            toastEvent({ severity: "success", summary: `${ response.data.message }` });
            storeDataMembers.membersData = [];
            await router.push({ name: "inscribirse" });
            refVoucherImage.value.remove();
            resetForm();
            loadingSave.value = false;
        } else {
            console.error("Fail", response);
            loadingSave.value = false;
        }
    } catch (error) {
        loadingSave.value = false;
        console.log(error);
    }
}, () => {
    refVoucherImage.value.remove();
    toastEvent({ severity: "warn", summary: "Error al guardar", detail: "Por favor, agregue la imagen." });
});

const filterPaymentMethods = computed(() => {
    return usePaymentMethodStore.paymentMethod.filter(pm => pm.description !== "EFECTIVO" && pm.active);
});

const onValueSelectPayment = (id: number) => {
    const found = filterPaymentMethods.value.find(pm => pm.id === id);
    if ( !found) return;
    dataForViewPayment.value = found;
};

const onGetRates = async() => {
    const { response } = await Api.Get({ route: "tarifa", params: { activity_shortname: route.params.slug } });
    if (response && response?.status === 200) {
        const results = response.data?.results ?? response.data;
        useStoreRates.rate = Array.isArray(results) ? results : [];
        if (useStoreRates.rate.length === 0) {
            toastEvent({ severity: "error", summary: "No hay tarifas disponibles, el registro no procederá" });
            await router.push({ name: "webPage", params: { slug: route.params.slug } });
        }
    }
};

onMounted(async() => {
    await onGetRates();
    await storePaymentMethod().getPaymentMethod(route.params?.slug as string);
    await storeActivities().getActivities(route.params.slug === "console" ? undefined : route.params.slug as string);
    const dataRate = useStoreRates.rate.find(rt => rt.selected);
    if (dataRate) {
        setRate(dataRate?.id as number);
    }
});

</script>

<template>
    <main class="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen flex flex-col py-10">
        <div class="form-wrapper">
            <!-- HEADER -->
            <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                    <i-material-symbols-account-balance-wallet class="text-green-400 text-2xl"/>
                </div>
                <h2 class="text-3xl md:text-4xl text-white font-bold tracking-tight">Pago de Inscripción</h2>
                <p class="text-slate-400 mt-2 text-base">Completa los datos de pago para finalizar tu inscripción</p>
            </div>

            <!-- RESUMEN DE PAGO -->
            <div class="form-card relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                <div class="relative">
                    <div class="flex items-center gap-2 mb-5">
                        <i class="pi pi-receipt text-green-400"></i>
                        <h3 class="text-lg font-semibold dark:text-white text-surface-900">Resumen de Pago</h3>
                    </div>
                    <div class="flex flex-col items-center gap-3 py-4">
                        <div class="flex items-center gap-2 bg-surface-200/50 dark:bg-white/5 rounded-xl px-5 py-3">
                            <i class="pi pi-users text-slate-400"></i>
                            <span class="text-lg font-medium dark:text-slate-200 text-surface-700">
                                {{ storeDataMembers.membersData.length }} persona(s) agregadas
                            </span>
                        </div>
                        <Divider class="!my-1"/>
                        <div class="text-center">
                            <span class="text-sm text-slate-400 uppercase tracking-wider font-medium">Total a pagar</span>
                            <p class="text-4xl font-bold text-green-400 mt-1">S/. {{ useStoreTotalRate.calculateRate(false) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-card">
                <div class="flex items-center gap-2 mb-5">
                    <i class="pi pi-credit-card text-blue-400"></i>
                    <h3 class="text-lg font-semibold dark:text-white text-surface-900">Método de Pago</h3>
                </div>
                <ValidateFormItem label="Seleccione el método de pago" name="paymentmethod" v-slot="{ error}">
                    <Select v-model="paymentmethod" :options="filterPaymentMethods" optionLabel="description" option-value="id" fluid
                            size="large" @value-change="(value) => onValueSelectPayment(value)" :invalid="!!error"
                            placeholder="Seleccione un método..."/>
                </ValidateFormItem>
                <Transition name="fade">
                    <div v-if="paymentmethod" class="mt-5 rounded-xl overflow-hidden border dark:border-white/10 border-surface-200">
                        <view-payment-methods :description="dataForViewPayment.description" :account="dataForViewPayment.account"
                                              :icon="dataForViewPayment.icon" :cci="dataForViewPayment.cci" :id="dataForViewPayment.id"
                                              :active="dataForViewPayment.active"/>
                    </div>
                </Transition>
            </div>

            <!-- VOUCHER -->
            <div class="form-card">
                <div class="flex items-center gap-2 mb-5">
                    <i class="pi pi-image text-amber-400"></i>
                    <h3 class="text-lg font-semibold dark:text-white text-surface-900">Comprobante de Pago</h3>
                </div>
                <p class="text-sm dark:text-slate-400 text-surface-500 mb-4">
                    Suba una imagen del voucher de pago (PNG, JPG). Máximo 1MB.
                </p>
                <ValidateFormItem label="" hide-label :error="errors.voucherfile">
                    <FileUpload name="voucher" :accept="fileAccept" :max-file-size="1000000" :file-limit="1" class="w-full"
                                ref="refVoucherImage" @select="(files:FileUploadSelectEvent)=> setVoucherImageFile(files.files[0])"
                                :show-cancel-button="false" @remove="setVoucherImage({})" :show-upload-button="false" input-id="voucherfile"
                                invalid-file-size-message="Peso de imagen inválido" invalid-file-limit-message="1 imagen máximo.">
                    </FileUpload>
                </ValidateFormItem>
            </div>

            <!-- ACCIONES -->
            <div class="flex flex-col md:flex-row gap-3 mt-2 mb-8">
                <Button label="Ver Lista" severity="secondary" @click="updateVisibilityDrawer" size="large"
                        v-if="storeDataMembers.membersData.length >= 1" fluid #icon>
                    <i class="pi pi-list-check"></i>
                </Button>
                <Button label="Enviar y Pagar" @click="saveAllMembers()" fluid size="large"
                        :disabled="loadingSave" :loading="loadingSave"
                        class="!bg-green-500 !border-green-500 hover:!bg-green-600" #icon>
                    <i class="pi pi-check-circle"></i>
                </Button>
            </div>
        </div>
        <drawer-members-saved ref="refDrawerMembersSaved" redirectUrl="event-pay" :isPage="false"
                              urlToAdd="event-inscription"/>
    </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
