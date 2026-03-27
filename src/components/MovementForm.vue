<script setup lang="ts">

import { computed, onMounted, ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { Api } from "@/api/connection";
import { storeActivities, storePaymentMethod, storeConcepts } from "@/stores/generalInfoStore.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { TillMovementActions, TillMovements } from "@/types/TillMovements.ts";

const props = defineProps<{ closeModal: () => void; isIncome: boolean; refreshData: () => Promise<void>; }>();

const userStore = useUserDataConfigStore();
const useConceptStore = storeConcepts();
const usePaymentMethod = storePaymentMethod();

const schemaValidate = yup.object({
    amount: yup.number().required("Monto es requerido").positive("Monto debe ser positivo"),
    concept: yup.number().nullable(),
    description: yup.string().required("Descripción es requerida"),
    payment_method: yup.number().required("Método de pago es requerido"),
    reference: yup.string().required("Referencia es requerida")
});

const { handleSubmit } = useForm<TillMovements>({
    initialValues: {
        user: userStore.userData.user.id
    },
    validationSchema: schemaValidate
});

const { value: description } = useField<string>("description");
const { value: reference } = useField<string>("reference");
const { value: status } = useField<string>("status");
const { value: amount } = useField<number>("amount");
const { value: concept } = useField<number | null>("concept");
const { value: payment_method } = useField<number | null>("payment_method");

const paymentMethodsOptions = computed(() => usePaymentMethod.paymentMethod.map(p => ({ label: p.description, value: p.id })));

const conceptsOptions = computed(() => useConceptStore.concepts.map(c => ({
    label: c.description, value: c.id, concept_type: c.concept_type
})).filter(d => d.concept_type === (props.isIncome ? "I" : "E")));

const stausOptions = ref([
    { label: "BORRADOR", value: "DRAFT" },
    { label: "CONTABILIZADO", value: "POSTED" },
    { label: "ANULADO", value: "VOID" }
]);

const saveMovement = handleSubmit(async(values) => {
    const activeActivity = storeActivities().activities.find(a => a.is_active);
    if ( !activeActivity) {
        useGlobalToast({ severity: "error", summary: "No hay actividad activa" });
        return;
    }
    const data = {
        ...values,
        activity: activeActivity.id,
        status: "DRAFT",
        user: userStore.userData.user.id
    };
    const { response }: TillMovementActions = await Api.Post({ route: "till/movements", data });
    if (response && response.status === 201) {
        useGlobalToast({ severity: "success", summary: "Movimiento creado correctamente" });
        props.closeModal();
        await props.refreshData();
    } else {
        useGlobalToast({ severity: "error", summary: "Error al crear movimiento" });
    }
});

onMounted(() => {
    usePaymentMethod.getPaymentMethod();
    useConceptStore.getConcepts();
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="12" label="Descripción" name="description" v-slot="{ error }">
            <InputText v-model="description" fluid input-id="description" :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Referencia" name="reference" v-slot="{ error }">
            <InputText v-model="reference" fluid input-id="reference" :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Estado" name="status" v-slot="{ error }">
            <Select v-model="status" fluid labelId="status" :invalid="!!error" :options="stausOptions" optionLabel="label"
                    optionValue="value" placeholder="Seleccionar"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Monto" name="amount" v-slot="{ error }">
            <InputNumber v-model="amount" fluid input-id="amount" mode="currency" currency="PEN" :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem span="6" label="Concepto" name="concept" v-slot="{ error }">
            <Select v-model="concept" :options="conceptsOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar" fluid
                    :invalid="!!error">
                <template #option="slotProps">
                    <div class="flex align-items-center">
                        {{ slotProps.option.label }}
                        <Badge :value="slotProps.option.concept_type === 'I' ? 'Ingreso' : 'Egreso'"
                               :severity="slotProps.option.concept_type === 'I' ? 'success' : 'danger'" class="ml-2"/>
                    </div>
                </template>
            </Select>
        </ValidateFormItem>
        <ValidateFormItem mark span="12" label="Método de Pago" name="payment_method" v-slot="{ error }">
            <Select v-model="payment_method" :options="paymentMethodsOptions" optionLabel="label" optionValue="value"
                    placeholder="Seleccionar" fluid :invalid="!!error"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button fluid label="Cancelar" severity="secondary" @click="props.closeModal"/>
        <Button fluid :label="props.isIncome ? 'Guardar Ingreso' : 'Guardar Egreso'" @click="saveMovement"/>
    </div>
</template>
