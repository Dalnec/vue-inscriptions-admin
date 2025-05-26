<script setup lang="ts">

import router from "@/router";
import { onMounted, ref } from "vue";
import type { InterfaceActionsActivities, InterfaceActivities, Settings } from "@/stores/interfaceActivities.ts";
import { useField, useForm } from "vee-validate";
import { Api } from "@/api/connection.ts";
import { storeActivities } from "@/stores/generalInfoStore.ts";
import * as yup from "yup";
import type { AutoCompleteCompleteEvent } from "primevue";

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
    const { response }: InterfaceActionsActivities = await Api.Put({ route: `activity/${ values?.id }`, data: { ...values } });
    if (response.status === 200) {
        await useStoreActivities.getActivities();
        resetForm({ values: response.data });
    }
}, () => {

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
                    <Button severity="secondary" size="small" rounded @click="router.push({name: 'settings', force: true})">
                        <template #icon>
                            <i-material-symbols-arrow-back-rounded/>
                        </template>
                    </Button>
                    <p>Configuración de Evento</p>
                </div>
                <Divider class="!my-0 !mt-2"/>
            </div>
        </template>
        <template #content>
            <div class="mx-auto max-w-screen-sm align-items-form sm:px-6 md:px-8 lg:px-10">
                <FormItem label="Titulo" cols="12">
                    <InputText v-model="title" fluid/>
                </FormItem>
                <FormItem label="Descripción" cols="12">
                    <Textarea v-model="description" fluid/>
                </FormItem>
                <FormItem label="Ubicación" cols="12">
                    <InputText v-model="location" fluid/>
                </FormItem>
                <FormItem label="Fecha de inicio" cols="12">
                    <DatePicker showTime hourFormat="24" v-model="start_date" fluid/>
                </FormItem>
                <FormItem label="Fecha de Termino" cols="12">
                    <DatePicker showTime hourFormat="24" v-model="end_date" fluid/>
                </FormItem>
                <FormItem label="Correos" cols="12">
                    <AutoComplete v-model="settings.inscription.emails" fluid @complete="search" :suggestions="itemsEmail" :typeahead="true"
                                  multiple/>
                </FormItem>
                <FormItem label="Mostrar Tarifas" cols="6">
                    <ToggleSwitch v-model="settings.inscription.show_tarifas" fluid/>
                </FormItem>
                <FormItem label="Enviar Correos" cols="6">
                    <ToggleSwitch v-model="settings.inscription.send_email" fluid/>
                </FormItem>
                <div class="align-buttons-card-footer max-cols-12">
                    <Button label="Cancelar" severity="secondary" @click="onResetForm"/>
                    <Button label="Guardar cambios" @click="onSaveForm"/>
                </div>
            </div>
        </template>
    </Card>
</template>
