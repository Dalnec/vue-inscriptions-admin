<script setup lang="ts">

import type { InterfaceRates } from "@/types/InterfaceRates.ts";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { onMounted, ref } from "vue";
import { Api } from "@/api/connection.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { useRoute } from "vue-router";
import type { InterfaceActivities, InterfaceResponseActivities } from "@/types/interfaceActivities.ts";

const props = defineProps<{ formData?: InterfaceRates, closeModal: () => void, refreshData: () => Promise<void> }>();
const loading = ref(false);
const fieldInitial = ref<InterfaceRates>({ active: true, description: "", price: "", selected: true });
const activitiesOptions = ref<InterfaceActivities[]>([]);

const route = useRoute();

const validationSchema = yup.object({
    description: yup.string().required("Agregue un nombre de cuenta")
});

const { handleSubmit, setValues } = useForm({ validationSchema, initialValues: fieldInitial.value });

const { value: description } = useField<string>("description");
const { value: price } = useField<string>("price");
const { value: selected } = useField<boolean>("selected");
const { value: active } = useField<boolean>("active");
const { value: activity } = useField<number | null>("activity");

const onSavePayments = handleSubmit(async(values) => {
    loading.value = true;
    const isUpdate = !!props.formData?.id;
    const route = `tarifa${ isUpdate ? `/${ props.formData.id }` : "" }`;
    const method = isUpdate ? Api.Put : Api.Post;
    const { response } = await method({ route, data: { ...values } });

    if (response && [ 200, 201 ].includes(response.status)) {
        loading.value = false;
        toastEvent({ severity: "success", summary: `Datos ${ isUpdate ? "editados" : "agregados" }` });
        await props.refreshData();
        props.closeModal();
    }
});

const onGetActivities = async() => {
    const { response }: InterfaceResponseActivities = await Api.Get({ route: "activity" });
    if (response && response.status === 200) {
        return response.data;
    }
    return [] as InterfaceActivities[];
};

onMounted(async() => {
    if (props.formData?.id) setValues({ ...props.formData });
    activitiesOptions.value = await onGetActivities();
    activity.value = activitiesOptions.value.find((item) => item.shortname === route.params?.slug)?.id || null;
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem label="Descripción" span="12">
            <Textarea fluid v-model="description"/>
        </ValidateFormItem>
        <ValidateFormItem label="Precio" span="6">
            <InputText fluid v-model="price" v-key-filter.num/>
        </ValidateFormItem>
        <ValidateFormItem label="Seleccionable en Pagina web" span="3">
            <ToggleSwitch fluid v-model="selected"/>
        </ValidateFormItem>
        <ValidateFormItem label="Activo" span="3">
            <ToggleSwitch fluid v-model="active"/>
        </ValidateFormItem>
        <ValidateFormItem hide-label hide-error span="6">
            <Button label="Cancelar" @click="props.closeModal()" fluid/>
        </ValidateFormItem>
        <ValidateFormItem hide-label hide-error span="6">
            <Button :label="props.formData?.id ? 'Editar' : 'Crear'" @click="onSavePayments" :loading fluid/>
        </ValidateFormItem>
    </div>
</template>
