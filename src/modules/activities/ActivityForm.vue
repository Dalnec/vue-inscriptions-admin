<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import { useField, useForm } from "vee-validate";
import useGlobalToast from "@/composables/toastEvent.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { InterfaceActivities, Settings } from "@/types/interfaceActivities.ts";
import * as yup from "yup";
import { formatDateToString } from "@/composables/convertDates.ts";
import type { AutoCompleteCompleteEvent } from "primevue";

const props = defineProps<{
    closeModal: () => void;
    formData?: InterfaceActivities;
    refreshData: () => Promise<void>;
}>();

const loading = ref(false);
const itemsEmail = ref<string[]>([]);

const settingsForm = ref<Settings>({
    inscription: {
        emails: [],
        send_email: false,
        show_tarifas: true
    }
});

const search = (event: AutoCompleteCompleteEvent) => {
    itemsEmail.value = [ "@gmail.com", "@hotmail.com", "@outlook.com" ].map((item) => event.query + item);
};

const schemaValidate = yup.object().shape({
    description: yup.string(),
    end_date: yup.date().required("Fecha de fin es requerida"),
    is_active: yup.boolean(),
    location: yup.string(),
    start_date: yup.date().required("Fecha de inicio es requerida"),
    title: yup.string().required("Título es requerido")
});

const { handleSubmit, setValues } = useForm<InterfaceActivities>({ initialValues: { is_active: true }, validationSchema: schemaValidate });

const { value: title } = useField<string>("title");
const { value: shortname } = useField<string>("shortname");
const { value: description } = useField<string>("description");
const { value: location } = useField<string>("location");
const { value: start_date } = useField<Date | null>("start_date");
const { value: end_date } = useField<Date | null>("end_date");

const saveActivity = handleSubmit(async(formValues) => {
    try {
        loading.value = true;
        const dataToSend = {
            ...formValues,
            end_date: formatDateToString(formValues.end_date as Date, "yyyy-MM-dd HH:mm:ss"),
            is_active: true,
            settings: JSON.stringify(settingsForm.value),
            start_date: formatDateToString(formValues.start_date as Date, "yyyy-MM-dd HH:mm:ss")
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
        }
    } catch (e) {
        console.log(e);
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

const parseSettings = (value: unknown): Settings => {
    try {
        if (typeof value === "string") {
            return JSON.parse(value);
        }
        return value as Settings;
    } catch {
        return settingsForm.value;
    }
};

onMounted(() => {
    if (props.formData?.id) {

        settingsForm.value = parseSettings(props.formData.settings);

        setValues({
            ...props.formData,
            end_date: props.formData.end_date ? new Date(props.formData.end_date) : null,
            start_date: props.formData.start_date ? new Date(props.formData.start_date) : null
        });
    }
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="8" label="Título" name="title" v-slot="{ error }">
            <InputText v-model="title" fluid input-id="title" :invalid="!!error"
                       placeholder="Ingrese el título de la actividad"/>
        </ValidateFormItem>
        <ValidateFormItem label="Abreviatura" span="4" name="shortname" v-slot="{ error }">
            <InputText v-model="shortname" :invalid="!!error" fluid/>
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
            <DatePicker v-model="start_date" input-id="start_date" fluid show-time hour-format="24"
                        :invalid="!!error" placeholder="Seleccione la fecha de inicio"/>
        </ValidateFormItem>

        <ValidateFormItem mark span="6" label="Fecha de Fin" name="end_date" v-slot="{ error }">
            <DatePicker v-model="end_date" input-id="end_date" fluid show-time hour-format="24"
                        :invalid="!!error" placeholder="Seleccione la fecha de fin"/>
        </ValidateFormItem>
    </div>

    <div class="mt-4">
        <h3 class="text-lg font-semibold mb-3">Configuración de Inscripción</h3>

        <div class="flex items-center gap-3 mb-3">
            <Checkbox v-model="settingsForm.inscription.send_email" binary/>
            <label>Enviar notificaciones por email</label>
        </div>

        <div class="flex items-center gap-3 mb-3">
            <Checkbox v-model="settingsForm.inscription.show_tarifas" binary/>
            <label>Mostrar tarifas</label>
        </div>

        <div v-if="settingsForm.inscription.send_email">
            <AutoComplete v-model="settingsForm.inscription.emails" fluid @complete="search" :suggestions="itemsEmail" :typeahead="true"
                          multiple/>
        </div>
    </div>

    <div class="align-buttons-submit">
        <Button fluid label="Cancelar" severity="secondary" @click="props.closeModal" :loading="loading"/>
        <Button fluid :label="props.formData ? 'Editar Actividad' : 'Guardar Actividad'" @click="saveActivity"
                :loading="loading"/>
    </div>
</template>

