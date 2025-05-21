<script setup lang="ts">

import { useMembersStore } from "@/stores/storeMembers.ts";
import DrawerMembersSaved from "@/components/drawerMembersSaved.vue";
import { computed, onMounted, ref } from "vue";
import { Api } from "@/api/connection.ts";
import type { FileUploadSelectEvent } from "primevue";
import FormItem from "@/components/formItem.vue";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import toastEvent from "@/composables/toastEvent.ts";
import { fileToBase64 } from "@/composables/convertImageToUpload.ts";
import { storeActivities, storeActivityActive, storePaymentMethod, storePriceRate, storeRate } from "@/stores/generalInfoStore.ts";
import ViewPaymentMethods from "@/components/viewPaymentMethods.vue";
import router from "@/router/index.ts";
import type { PaymentMethod } from "@/stores/interfaceActivities.ts";
import { useRoute } from "vue-router";
import type { InterfaceMembers } from "@/composables/interfaceMembers.ts";

export type VoucherImageType = { file: File; objectURL: string; };

const refDrawerMembersSaved = ref();
const loadingSave = ref(false);
const updateVisibilityDrawer = () => refDrawerMembersSaved.value.visibleDrawer = true;
const storeDataMembers = useMembersStore();
const fileAccept = ref<string>("image/png, image/jpeg, image/jpg");
const refVoucherImage = ref();
const dataForViewPayment = ref<PaymentMethod>({ account: "", active: true, cci: null, description: "", icon: "", id: null });
const usePaymentMethodStore = storePaymentMethod();
const useStoreTotalRate = storePriceRate();
const useStoreActivities = storeActivities();
const useStoreRates = storeRate();
const labelRateSelected = ref("");
const useStoreActivityActive = storeActivityActive();

const filterRates = computed(() => {
    return useStoreRates.rate.filter(rt => rt.active);
});

const validationSchema = ref(yup.object({
    paymentmethod: yup.number().required("Seleccione el método de pago"),
    // activity: yup.number().required("Seleccione una actividad"),
    tarifa: yup.number().required("Seleccione una tarifa"),
    voucheramount: yup.number().min(1, "Agregue un valor valido").required("Requerido"),
    voucherfile: yup.object<{ file: File; objectURL: string }>().nullable().when("paymentmethod", {
        is: () => {
            return dataForViewPayment.value.description !== "EFECTIVO";
        },
        then: (schema) =>
            schema.required("Imagen requerida").shape({
                file: yup.mixed<File>().required("Img. requerida"),
                objectURL: yup.string().required("Img. requerida")
            }),
        otherwise: (schema) => schema.nullable()
    })
}));

const { handleSubmit, errors, resetForm } =
    useForm<{ voucheramount: null, voucherfile: VoucherImageType | {}, paymentmethod: null | number, tarifa: number }>({
        validationSchema, initialValues: { voucherfile: {}, paymentmethod: null }
    });

const { value: voucherfile, setValue: setVoucherImage } = useField<VoucherImageType | {}>("voucherfile");
const { value: paymentmethod } = useField<number | null>("paymentmethod");
const { value: tarifa, setValue: setRate } = useField<number | undefined>("tarifa");
const { value: voucheramount, setValue: setVoucheramount } = useField<number>("voucheramount");

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

        const dataRate = storeRate().rate.find(rt => rt.selected);
        const dataActivity = useStoreActivities.activities.find(act => act.is_active);

        const payload: Record<string, any> = {
            voucheramount: useStoreTotalRate.calculateRate(voucheramount.value),
            tarifa: useStoreActivityActive.showRatesActivity ? tarifa.value : dataRate?.id,
            activity: null,
            paymentmethod: paymentmethod.value,
            people: storeDataMembers.membersData
        };
        if (isVoucherImage(voucherfile.value)) payload.voucherfile = await fileToBase64(voucherfile.value.file);

        if ( !dataActivity) payload.activity = null;
        else payload.activity = dataActivity.id;

        const { response } = await Api.Post({ route: "inscription-groups/register-group", data: payload });

        if (response && response?.status === 201) {
            toastEvent({ severity: "success", summary: `${ response.data.message }` });
            storeDataMembers.membersData = [];
            storeDataMembers.selectedMember = {} as InterfaceMembers;
            resetForm();
            refVoucherImage.value.remove();
            loadingSave.value = false;
            await router.push({ name: "newRegister", force: true });
        } else {
            console.error("Fail", response);
            loadingSave.value = false;
        }
    } catch (error) {
        loadingSave.value = false;
        console.log(error);
    }
}, () => {
    refVoucherImage.value?.remove();
    toastEvent({ severity: "error", summary: "Error al guardar", message: "Por favor, agregue la imagen." });
});

const filterPaymentMethods = computed(() => {
    return usePaymentMethodStore.paymentMethod.filter(pm =>  /*pm.id !== 1&& pm.description !== "EFECTIVO" &&*/  pm.active);
});

const onSelected = (payload: { idRate: number, priceRate: string, nameRate: string }) => {
    setRate(payload.idRate);
    labelRateSelected.value = payload.nameRate;
    setVoucheramount(parseFloat(payload.priceRate));
};

const onValueSelectPayment = (id: number) => {
    const found = filterPaymentMethods.value.find(pm => pm.id === id);
    if ( !found) return;
    dataForViewPayment.value = found;
};

const route = useRoute();
const membersStore = useMembersStore();

const handleClickCard = async(memberData: InterfaceMembers) => {
    membersStore.setSelectedMember(memberData);
    if (route.name !== "newRegister") {
        await router.push({ name: "newRegister" });
    }
};

onMounted(() => {
    const dataRate = storeRate().rate.find(rt => rt.selected);
    if (dataRate) {
        setRate(dataRate?.id);
        onSelected({ idRate: dataRate.id, priceRate: dataRate.price, nameRate: dataRate.description });
    }
});

</script>

<template>
    <Card>
        <template #title>
            Formulario de Pago
        </template>
        <template #subtitle>
            Revise los datos antes de pagar
        </template>
        <template #content>
            <div class="mx-auto max-w-screen-sm align-items-form sm:px-6 md:px-8 lg:px-10">
                <FormItem label="Método de pago" cols="12" :error="errors.paymentmethod">
                    <Select v-model="paymentmethod" :options="filterPaymentMethods" optionLabel="description" option-value="id" fluid
                            size="large" @value-change="(value) => onValueSelectPayment(value)"/>
                </FormItem>
                <FormItem cols="12" hide-error hide-label v-if="paymentmethod">
                    <view-payment-methods :description="dataForViewPayment.description" :account="dataForViewPayment.account"
                                          :icon="dataForViewPayment.icon" :cci="dataForViewPayment.cci" :id="dataForViewPayment.id"
                                          :active="dataForViewPayment.active"/>
                </FormItem>
                <FormItem cols="12" hide-label :error="errors.tarifa" v-if="useStoreActivityActive.showRatesActivity">
                    <div class="grid grid-cols-4 gap-3">
                        <rate-data v-for="act in filterRates" :key="act.id" :name-rate="act.description" :id-rate="act.id"
                                   :id-rate-selected="tarifa" :price-rate="act.price" @on-rate-selected="onSelected"/>
                    </div>
                </FormItem>
                <FormItem cols="12" :error="errors.voucheramount" label="Monto a pagar" v-if="labelRateSelected === 'OTRO MONTO'">
                    <InputNumber v-model="voucheramount" :min="1" prefix="S/" fluid size="large"/>
                </FormItem>
                <FormItem label="Voucher de pago" cols="12" :error="errors.voucherfile"
                          v-if="dataForViewPayment.description !== 'EFECTIVO'">
                    <FileUpload name="voucher" :accept="fileAccept" :max-file-size="1000000" :file-limit="1" class="w-full"
                                ref="refVoucherImage" @select="(files:FileUploadSelectEvent)=> setVoucherImageFile(files.files[0])"
                                :show-cancel-button="false" @remove="setVoucherImage({})" :show-upload-button="false" input-id="voucherfile"
                                invalid-file-size-message="Peso de imagen invalido" invalid-file-limit-message="1 imagen máximo.">
                    </FileUpload>
                </FormItem>
                <div class="max-cols-12">
                    <p class="text-2xl">
                        Hay {{ storeDataMembers.membersData.length }} persona(s) agregadas
                    </p>
                </div>
                <div class="mb-4 rounded-md bg-slate-400 p-4 text-center text-2xl font-bold max-cols-12">
                    Total S/ {{ useStoreTotalRate.calculateRate(voucheramount) }}
                </div>
                <div class="max-cols-4">
                    <Button label="Ver Lista" severity="secondary" @click="updateVisibilityDrawer"
                            v-if="storeDataMembers.membersData.length >= 1" fluid>
                        <template #icon>
                            <i-material-symbols-list-alt-check/>
                        </template>
                    </Button>
                </div>

                <div class="max-cols-8">
                    <Button label="Enviar y Pagar" @click="saveAllMembers()" fluid :disabled="loadingSave" :loading="loadingSave">
                        <template #icon>
                            <i-material-symbols-sync-saved-locally/>
                        </template>
                    </Button>
                </div>
            </div>
            <drawer-members-saved ref="refDrawerMembersSaved" @onClickCard="handleClickCard"/>
        </template>
    </Card>
</template>
