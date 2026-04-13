<script setup lang="ts">

import { Api } from "@/api/connection";
import { storeActivities, storePaymentMethod, storeConcepts } from "@/stores/generalInfoStore.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData";
import { computed, h, onMounted, ref } from "vue";
import { useField, useForm } from "vee-validate";
import { useModal } from "@/composables/useModal.ts";
import { useRoute } from "vue-router";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { TillMovementActions, TillMovements } from "@/types/TillMovements.ts";
import type { ConceptsInterface } from "@/types/ConceptsInterface.ts";
import ConceptsForm from "@/modules/tillConcept/ConceptsForm.vue";
import * as yup from "yup";

const props = defineProps<{ closeModal: () => void; isIncome: boolean; refreshData: () => Promise<void>; }>();

const route = useRoute();
const userStore = useUserDataConfigStore();
const useConceptStore = storeConcepts();
const usePaymentMethod = storePaymentMethod();
const useStoreActivities = storeActivities();
const { openModal, closeModal } = useModal();

const conceptSelected = ref<ConceptsInterface>();

const schemaValidate = yup.object({
    amount: yup.number().required("Monto es requerido").positive("Monto debe ser positivo"),
    concept: yup.number().nullable(),
    description: yup.string().required("Descripción es requerida"),
    payment_method: yup.number().required("Método de pago es requerido")
});

const { handleSubmit } = useForm<TillMovements>({
    initialValues: {
        user: userStore.userData.user?.id
    },
    validationSchema: schemaValidate
});

const { value: description } = useField<string>("description");
const { value: reference } = useField<string>("reference");
const { value: amount } = useField<number>("amount");
const { value: concept } = useField<number | null>("concept");
const { value: payment_method } = useField<number | null>("payment_method");

const paymentMethodsOptions = computed(() => usePaymentMethod.paymentMethod.map(p => ({ label: p.description, value: p.id })));

const conceptsOptions = computed(() => useConceptStore.concepts.map(c => ({
    label: c.description, value: c.id, concept_type: c.concept_type
})).filter(d => d.concept_type === (props.isIncome ? "I" : "E")));

const saveMovement = handleSubmit(async(values) => {
    const dataActivity = useStoreActivities.activities.find(act => act.shortname === route.params.slug);

    if ( !dataActivity) {
        useGlobalToast({ severity: "error", summary: "No hay actividad activa" });
        return;
    }
    const data = {
        ...values,
        activity: dataActivity.id,
        status: "POSTED",
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

const onGetConceptSelected = (conceptId: number) => {
    conceptSelected.value = useConceptStore.concepts.find(c => c.id === conceptId);
};

const onManageConcept = (concept?: ConceptsInterface) => {
    openModal({
        component: h(ConceptsForm, {
            closeModal: () => closeModal(),
            formData: concept?.id ? { ...concept } : undefined,
            disableInternal: true,
            defaultType: props.isIncome ? "I" : "E",
            refreshData: () => useConceptStore.getConcepts()
        }),
        header: concept?.id ? "Editar Concepto" : `Agregar Nuevo Concepto de ${ props.isIncome ? "Ingreso" : "Egreso" }`,
        width: "50vw"
    });
};


onMounted(() => {
    usePaymentMethod.getPaymentMethod(route.params.slug as string);
    useConceptStore.getConcepts();
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="12" label="Descripción" name="description" v-slot="{ error }">
            <InputText v-model="description" fluid input-id="description" :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem span="6" label="Referencia" name="reference">
            <InputText v-model="reference" fluid input-id="reference"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Monto" name="amount" v-slot="{ error }">
            <InputNumber v-model="amount" fluid input-id="amount" currency="PEN" prefix="S/ " :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem span="6" label="Concepto" name="concept" v-slot="{ error }">
            <InputGroup>
                <Select v-model="concept" :options="conceptsOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar" fluid
                        @update:modelValue="v => onGetConceptSelected(v)" :invalid="!!error">
                    <template #option="slotProps">
                        <div class="flex items-center flex-wrap">
                            <p> {{ slotProps.option.label }} </p>
                            <Badge :value="slotProps.option.concept_type === 'I' ? 'Ingreso' : 'Egreso'"
                                   :severity="slotProps.option.concept_type === 'I' ? 'success' : 'danger'" class="ml-2"/>
                        </div>
                    </template>
                </Select>
                <Button v-tooltip="!isIncome ? 'Concepto egreso' : 'Concepto ingreso' " @click="onManageConcept(conceptSelected)" #icon>
                    <i-material-symbols-list-alt-add/>
                </Button>
            </InputGroup>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Método de Pago" name="payment_method" v-slot="{ error }">
            <Select v-model="payment_method" :options="paymentMethodsOptions" optionLabel="label" optionValue="value"
                    placeholder="Seleccionar" fluid :invalid="!!error"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button fluid label="Cancelar" severity="secondary" @click="props.closeModal"/>
        <Button fluid :label="props.isIncome ? 'Guardar Ingreso' : 'Guardar Egreso'" @click="saveMovement"/>
    </div>
</template>
