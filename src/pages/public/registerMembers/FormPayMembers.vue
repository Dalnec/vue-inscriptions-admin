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
            await router.push({ name: "inscription-members" });
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
    return usePaymentMethodStore.paymentMethod.filter(pm => pm.id !== 1 && pm.description !== "EFECTIVO" && pm.active);
});

const onValueSelectPayment = (id: number) => {
    const found = filterPaymentMethods.value.find(pm => pm.id === id);
    if ( !found) return;
    dataForViewPayment.value = found;
};

const onGetRates = async() => {
    const { response } = await Api.Get({ route: "tarifa", params: { shortname: route.params.slug } });
    if (response && response?.status === 200) {
        useStoreRates.rate = response.data;
        if (useStoreRates.rate.length === 0) {
            toastEvent({ severity: "error", summary: "No hay tarifas disponibles, el registro no procederá" });
            await router.push({ name: "webPage", params: { slug: route.params.slug } });
        }
    }
};

onMounted(async() => {
    await onGetRates();
    await storeActivities().getActivities(route.params.slug === "console" ? undefined : route.params.slug as string);
    const rateSelected = storeRate().rate;
    const dataRate = rateSelected.find(rt => rt.selected);
    if (dataRate) {
        setRate(dataRate?.id as number);
    }
});

</script>

<template>
    <main class="bg-slate-900 text-white min-h-screen flex flex-col">
        <div class="form-wrapper">
            <!-- HEADER -->
            <div class="form-header-pay">
                <h2>Pago de Inscripción</h2>
                <p>Completa los datos de pago para finalizar tu inscripción</p>
            </div>

            <!-- INFORMACIÓN DE PAGO -->
            <div class="form-card">
                <h3 class="form-section-title">Resumen de Pago</h3>
                <div class="text-center mb-4">
                    <p class="text-2xl font-bold text-white">Persona(s) agregadas: {{ storeDataMembers.membersData.length }}</p>
                    <p class="text-3xl font-semibold text-green-400">Total S/. {{ useStoreTotalRate.calculateRate(false) }}</p>
                </div>
            </div>

            <div class="form-card">
                <h3 class="form-section-title">Método de Pago</h3>
                <ValidateFormItem label="Seleccione el método de pago" :error="errors.paymentmethod">
                    <Select v-model="paymentmethod" :options="filterPaymentMethods" optionLabel="description" option-value="id" fluid
                            size="large" @value-change="(value) => onValueSelectPayment(value)"/>
                </ValidateFormItem>
                <div v-if="paymentmethod" class="mt-4">
                    <view-payment-methods :description="dataForViewPayment.description" :account="dataForViewPayment.account"
                                          :icon="dataForViewPayment.icon" :cci="dataForViewPayment.cci" :id="dataForViewPayment.id"
                                          :active="dataForViewPayment.active"/>
                </div>
            </div>

            <!-- VOUCHER -->
            <div class="form-card">
                <h3 class="form-section-title">Comprobante de Pago</h3>
                <ValidateFormItem label="Suba el voucher de pago" :error="errors.voucherfile">
                    <FileUpload name="voucher" :accept="fileAccept" :max-file-size="1000000" :file-limit="1" class="w-full"
                                ref="refVoucherImage" @select="(files:FileUploadSelectEvent)=> setVoucherImageFile(files.files[0])"
                                :show-cancel-button="false" @remove="setVoucherImage({})" :show-upload-button="false" input-id="voucherfile"
                                invalid-file-size-message="Peso de imagen inválido" invalid-file-limit-message="1 imagen máximo.">
                    </FileUpload>
                </ValidateFormItem>
            </div>

            <!-- ACCIONES -->
            <div class="form-actions">
                <Button label="Ver Lista" severity="secondary" @click="updateVisibilityDrawer"
                        v-if="storeDataMembers.membersData.length >= 1" fluid #icon>
                    <i-material-symbols-list-alt-check/>
                </Button>
                <Button label="Enviar y Pagar" @click="saveAllMembers()" fluid :disabled="loadingSave" :loading="loadingSave" #icon>
                    <i-material-symbols-sync-saved-locally/>
                </Button>
            </div>
        </div>
        <drawer-members-saved ref="refDrawerMembersSaved" redirectUrl="event-pay" :isPage="false"
                              urlToAdd="event-inscription"/>
    </main>
</template>

<style>

.form-header-pay {
    @apply text-center mb-10;
}

.form-header-pay h2 {
    @apply text-3xl md:text-4xl text-white font-semibold;
}

.form-header-pay p {
    @apply text-slate-400 mt-2;
}

.form-actions {
    @apply flex flex-col md:flex-row gap-3 my-6;
}
</style>
