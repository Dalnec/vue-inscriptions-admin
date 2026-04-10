<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import { useField, useForm } from "vee-validate";
import useGlobalToast from "@/composables/toastEvent.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { ConceptsInterface, ConceptsInterfaceResponse } from "@/types/ConceptsInterface.ts";
import * as yup from "yup";
import { useRoute } from "vue-router";

const props = defineProps<{
    closeModal: () => void;
    formData?: ConceptsInterface;
    disableInternal?: boolean;
    defaultType?: "I" | "E"
    refreshData: () => Promise<void>;
}>();

const loading = ref(false);
const activity = ref<number | null>(null);
const route = useRoute();

const schemaValidate = yup.object().shape({
    description: yup.string().required("Descripción es requerida")
});

const { handleSubmit, setValues } = useForm<ConceptsInterface>({
    initialValues: { is_active: true, is_internal: false }, validationSchema: schemaValidate
});

const { value: description } = useField<string>("description");
const { value: concept_type } = useField<string>("concept_type");
const { value: is_internal } = useField<boolean>("is_internal");

const conceptTypeOptions = ref([
    { label: "Ingreso", value: "I" },
    { label: "Egreso", value: "E" }
]);

const saveConcept = handleSubmit(async(values) => {
    loading.value = true;

    const route = props.formData ? `till/concepts/${ props.formData.id }` : "till/concepts";
    const method = props.formData ? Api.Put : Api.Post;
    const { response }: ConceptsInterfaceResponse = await method({ route, data: values });
    if (response && (response.status === 201 || response.status === 200)) {
        useGlobalToast({
            severity: "success", summary: props.formData ? "Concepto editado correctamente" : "Concepto creado correctamente"
        });
        props.closeModal();
        await props.refreshData();
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

const onGetActivity = async(shortname: string): Promise<void> => {
    const { response } = await Api.Get({ route: "activity", params: { shortname } });
    if (response && response.status === 200) {
        const activities = response.data.data;
        activity.value = activities.length > 0 ? activities[0].id : null;
    }
};

onMounted(async() => {
    await onGetActivity(route.params.slug as string);
    if (props?.defaultType) concept_type.value = props.defaultType;
    if (props.formData?.id) {
        setValues({ ...props.formData });
    }
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="12" label="Descripción" name="description" v-slot="{ error }">
            <InputText v-model="description" fluid id="description" :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Tipo de Concepto" name="concept_type" v-slot="{ error }">
            <Select v-model="concept_type" :options="conceptTypeOptions" optionLabel="label" optionValue="value" placeholder="Seleccionar"
                    labelId="concept_type" fluid :invalid="!!error" :disabled="!!props.formData || !!props.defaultType"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Es Interno" name="is_internal" v-slot="{ error }">
            <ToggleSwitch v-model="is_internal" input-id="is_internal" :invalid="!!error" :disabled="!!props.formData || disableInternal"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button fluid label="Cancelar" severity="secondary" @click="props.closeModal" :loading="loading"/>
        <Button fluid :label="props.formData ? 'Editar Concepto' : 'Guardar Concepto'" @click="saveConcept" :loading="loading"/>
    </div>
</template>
