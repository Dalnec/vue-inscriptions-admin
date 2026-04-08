<script setup lang="ts">
import { ref } from "vue";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { LMap, LTileLayer, LMarker } from "@maxel01/vue-leaflet";
import "leaflet/dist/leaflet.css";

interface Settings {
    inscription: {
        send_email: boolean;
        show_tarifas: boolean;
        emails: string[];
    };
}

const itemsEmail = ref<string[]>([]);

const settingsForm = ref<Settings>({
    inscription: {
        emails: [],
        send_email: false,
        show_tarifas: true
    }
});

const activityForm = ref({
    title: "",
    description: "",
    shortname: "",
    start_date: null as null | Date,
    end_date: null as null | Date,
    location: "",
    lat: 5.857,
    lng: -76.022
});

const search = (event: AutoCompleteCompleteEvent) => {
    itemsEmail.value = [ "@gmail.com", "@hotmail.com", "@outlook.com" ].map(
        (item) => event.query + item
    );
};

const submitActivity = () => {
    const payload = {
        ...activityForm.value,
        settings: JSON.stringify(settingsForm.value)
    };
    console.log("Enviar payload:", payload);
};
</script>

<template>
    <div class="flex flex-col gap-6 p-6">

        <!-- Detalles y Fechas lado a lado -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <!-- Detalles -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-2">Detalles de la Actividad</h3>
                <ValidateFormItem label="Nombre" span="12">
                    <InputText fluid v-model="activityForm.title"/>
                </ValidateFormItem>

                <ValidateFormItem label="Nombre corto" span="12">
                    <InputText fluid v-model="activityForm.shortname"/>
                </ValidateFormItem>

                <ValidateFormItem label="Descripción" span="12">
                    <Textarea fluid v-model="activityForm.description" rows="4"/>
                </ValidateFormItem>
            </Card>

            <!-- Fechas -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-2">Fechas</h3>
                <ValidateFormItem label="Fecha de inicio" span="12">
                    <DatePicker v-model="activityForm.start_date" showIcon class="w-full"/>
                </ValidateFormItem>

                <ValidateFormItem label="Fecha de fin" span="12">
                    <DatePicker v-model="activityForm.end_date" showIcon class="w-full"/>
                </ValidateFormItem>
            </Card>

            <!-- Ubicación -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-2">Ubicación</h3>
                <ValidateFormItem label="Nombre del lugar" span="12">
                    <InputText fluid v-model="activityForm.location"/>
                </ValidateFormItem>

                <LMap style="height: 300px; width: 100%;" :zoom="13" :center="[activityForm.lat, activityForm.lng]">
                    <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
                    <LMarker :lat-lng="[activityForm.lat, activityForm.lng]" :draggable="true"
                             @update:lat-lng="(pos) => { activityForm.lat = pos[0]; activityForm.lng = pos[1]; }"/>
                </LMap>

                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Lat: {{ activityForm.lat }}, Lng: {{ activityForm.lng }}</p>
            </Card>

            <!-- Configuración de inscripción -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-2">Configuración de Inscripción</h3>
                <div class="align-items-form">
                    <ValidateFormItem label="Enviar notificaciones por email" span="6">
                        <Checkbox v-model="settingsForm.inscription.send_email" binary/>
                    </ValidateFormItem>

                    <ValidateFormItem label="Mostrar tarifas" span="6">
                        <Checkbox v-model="settingsForm.inscription.show_tarifas" binary/>
                    </ValidateFormItem>

                    <ValidateFormItem label="Emails" span="12" v-if="settingsForm.inscription.send_email">
                        <AutoComplete v-model="settingsForm.inscription.emails" fluid @complete="search" :suggestions="itemsEmail"
                                      :typeahead="true" multiple/>
                    </ValidateFormItem>
                </div>
            </Card>
        </div>

        <!-- Submit -->
        <div class="flex justify-end">
            <Button label="Crear Actividad" severity="success" @click="submitActivity"/>
        </div>
    </div>
</template>