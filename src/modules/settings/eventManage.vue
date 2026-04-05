<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { storeActivities } from "@/stores/generalInfoStore.ts";
import { page_config } from "@/assets/page_config.json";
import router from "@/router";
import { onMounted, ref } from "vue";
import { useField, useForm } from "vee-validate";
import { format } from "date-fns";
import toastEvent from "@/composables/toastEvent.ts";
import type { AutoCompleteCompleteEvent } from "primevue";
import type { InterfaceActionsActivities, InterfaceActivities, Settings } from "@/types/interfaceActivities.ts";
import * as yup from "yup";

const useStoreActivities = storeActivities();
const itemsEmail = ref<string[]>([]);

const search = (event: AutoCompleteCompleteEvent) => {
    itemsEmail.value = [ "@gmail.com", "@hotmail.com", "@outlook.com" ].map((item) => event.query + item);
};

const initialFields = ref<InterfaceActivities>({
    created: null, description: "", end_date: null, id: null, is_active: true, location: "", modified: null,
    settings: { inscription: { emails: [ "" ], send_email: false, show_tarifas: true } }, start_date: null, title: ""
});

const schemaValidate = ref(yup.object({
    title: yup.string().required("Seleccione una iglesia"),
    start_date: yup.string().required("Seleccione un género"),
    end_date: yup.string().required("Seleccione a donde pertenece")
}));

const { resetForm, handleSubmit } = useForm<InterfaceActivities>({ initialValues: initialFields.value, validationSchema: schemaValidate });

const { value: description } = useField<string>("description");
const { value: end_date } = useField<null | Date>("end_date");
const { value: title } = useField<string>("title");
const { value: shortname } = useField<string>("shortname");
const { value: location } = useField<string>("location");
const { value: start_date } = useField<null | Date>("start_date");
const { value: settings } = useField<Settings>("settings");

const onResetForm = () => {
    const isActive = useStoreActivities.activities.find(act => act.is_active);
    if (isActive) {
        resetForm({ values: { ...isActive } });
    }
};

const onSaveForm = handleSubmit(async(values) => {
    const { response }: InterfaceActionsActivities = await Api.Put({
        route: `activity/${ values?.id }`,
        data: {
            ...values,
            end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd hh:mm:ss") : null,
            start_date: values.start_date ? format(values.start_date, "yyyy-MM-dd hh:mm:ss") : null
        }
    });

    if (response.status === 200) {
        await useStoreActivities.getActivities(page_config.eventID);
        resetForm({ values: response.data });
    }
}, () => {
    toastEvent({ severity: "error", summary: "Campos obligatorios" });
});


onMounted(() => {
    onResetForm();
});

</script>

<template>
    <Card>
        <template #title>
            <div class="align-header">
                <div class="flex items-center gap-2">
                    <Button severity="secondary" size="small" rounded @click="router.push({name: 'settings', force: true})" #icon>
                        <i-material-symbols-arrow-back-rounded/>
                    </Button>
                    <p>Configuración de Evento</p>
                </div>
                <Divider class="!my-0 !mt-2"/>
            </div>
        </template>
        <template #content>
            <div class="mx-auto max-w-screen-sm align-items-form sm:px-6 md:px-8 lg:px-10">
                <ValidateFormItem label="Titulo" span="8" name="title" v-slot="{ error }">
                    <InputText v-model="title" :invalid="!!error" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Abreviatura" span="8" name="shortname" v-slot="{ error }">
                    <InputText v-model="shortname" :invalid="!!error" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Descripción" span="12" name="description" v-slot="{ error }">
                    <Textarea v-model="description" :invalid="!!error" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Ubicación" span="12" name="location" v-slot="{ error }">
                    <InputText v-model="location" :invalid="!!error" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Fecha de inicio" span="12" name="start_date" v-slot="{ error }">
                    <DatePicker showTime hourFormat="24" v-model="start_date" :invalid="!!error" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Fecha de Termino" span="12" name="end_date" v-slot="{ error }">
                    <DatePicker showTime hourFormat="24" v-model="end_date" :invalid="!!error" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Correos" span="12">
                    <AutoComplete v-model="settings.inscription.emails" fluid @complete="search" :suggestions="itemsEmail" :typeahead="true"
                                  multiple/>
                </ValidateFormItem>
                <ValidateFormItem label="Mostrar Tarifas" span="6">
                    <ToggleSwitch v-model="settings.inscription.show_tarifas" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Enviar Correos" span="6">
                    <ToggleSwitch v-model="settings.inscription.send_email" fluid/>
                </ValidateFormItem>
                <div class="align-buttons-card-footer max-cols-12">
                    <Button label="Cancelar" severity="secondary" @click="onResetForm"/>
                    <Button label="Guardar cambios" @click="onSaveForm"/>
                </div>
            </div>
        </template>
    </Card>
</template>
