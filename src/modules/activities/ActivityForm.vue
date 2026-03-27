<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import { useField, useForm } from "vee-validate";
import useGlobalToast from "@/composables/toastEvent.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { InterfaceActivities, Settings } from "@/types/interfaceActivities.ts";
import * as yup from "yup";
import { formatDateToString } from "@/composables/convertDates.ts";

const props = defineProps<{
    closeModal: () => void;
    formData?: InterfaceActivities;
    refreshData: () => Promise<void>;
}>();

const loading = ref(false);

const defaultSettings: Settings = {
    inscription: {
        emails: [],
        send_email: false,
        show_tarifas: true
    }
};

const schemaValidate = yup.object().shape({
    title: yup.string().required("Título es requerido"),
    description: yup.string(),
    location: yup.string(),
    start_date: yup.date().required("Fecha de inicio es requerida"),
    end_date: yup.date().required("Fecha de fin es requerida"),
    is_active: yup.boolean()
});

interface FormData {
    title: string;
    description: string;
    location: string;
    start_date: Date | null;
    end_date: Date | null;
    is_active: boolean;
}

const { handleSubmit, setValues } = useForm<FormData>({
    initialValues: {
        title: "",
        description: "",
        location: "",
        start_date: null,
        end_date: null,
        is_active: true
    },
    validationSchema: schemaValidate
});

const { value: title } = useField<string>("title");
const { value: description } = useField<string>("description");
const { value: location } = useField<string>("location");
const { value: start_date } = useField<any>("start_date");
const { value: end_date } = useField<any>("end_date");

const saveActivity = handleSubmit(async(formValues) => {
    loading.value = true;

    const dataToSend = {
        title: formValues.title,
        description: formValues.description,
        location: formValues.location,
        start_date: formatDateToString(formValues.start_date as Date, "yyyy-MM-dd HH:mm:ss"),
        end_date: formatDateToString(formValues.end_date as Date, "yyyy-MM-dd HH:mm:ss"),
        is_active: true,
        settings: defaultSettings
    };

    const route = props.formData ? `activity/${ props.formData.id }` : "activity";
    const method = props.formData ? Api.Put : Api.Post;

    const { response } = await method({ route, data: dataToSend });

    if (response && (response.status === 201 || response.status === 200)) {
        useGlobalToast({
            severity: "success",
            summary: props.formData ? "Actividad editada correctamente" : "Actividad creada correctamente"
        });
        props.closeModal();
        await props.refreshData();
        loading.value = false;
    } else {
        // Manejar errores de la API
        useGlobalToast({
            severity: "error",
            summary: "Error",
            detail: props.formData ? "Error al editar la actividad" : "Error al crear la actividad"
        });
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

onMounted(() => {
    if (props.formData?.id) {
        setValues({
            title: props.formData.title || "",
            description: props.formData.description || "",
            location: props.formData.location || "",
            start_date: props.formData.start_date ? new Date(props.formData.start_date) : null,
            end_date: props.formData.end_date ? new Date(props.formData.end_date) : null,
            is_active: props.formData.is_active
        });
    }
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="12" label="Título" name="title" v-slot="{ error }">
            <InputText v-model="title" fluid input-id="title" :invalid="!!error"
                       placeholder="Ingrese el título de la actividad"/>
        </ValidateFormItem>

        <ValidateFormItem span="12" label="Descripción" name="description" v-slot="{ error }">
            <Textarea v-model="description" fluid input-id="description" :invalid="!!error"
                      placeholder="Ingrese la descripción de la actividad" rows="3"/>
        </ValidateFormItem>

        <ValidateFormItem span="12" label="Ubicación" name="location" v-slot="{ error }">
            <InputText v-model="location" fluid input-id="location" :invalid="!!error"
                       placeholder="Ingrese la ubicación de la actividad"/>
        </ValidateFormItem>

        <ValidateFormItem mark span="6" label="Fecha de Inicio" name="start_date" v-slot="{ error }">
            <Calendar v-model="start_date" input-id="start_date" fluid show-time hour-format="24"
                      :invalid="!!error" placeholder="Seleccione la fecha de inicio"/>
        </ValidateFormItem>

        <ValidateFormItem mark span="6" label="Fecha de Fin" name="end_date" v-slot="{ error }">
            <Calendar v-model="end_date" input-id="end_date" fluid show-time hour-format="24"
                      :invalid="!!error" placeholder="Seleccione la fecha de fin"/>
        </ValidateFormItem>
    </div>

    <div class="align-buttons-submit">
        <Button fluid label="Cancelar" severity="secondary" @click="props.closeModal" :loading="loading"/>
        <Button fluid :label="props.formData ? 'Editar Actividad' : 'Guardar Actividad'" @click="saveActivity"
                :loading="loading"/>
    </div>
</template>

