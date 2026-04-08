<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { LMap, LTileLayer, LMarker } from "@maxel01/vue-leaflet";
import "leaflet/dist/leaflet.css";
import type { AutoCompleteCompleteEvent } from "primevue";
import { Api } from "@/api/connection.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { useRoute } from "vue-router";

const route = useRoute();

const isEditMode = ref(false);

const schema = yup.object({
    description: yup.string().required("La descripción es obligatoria"),
    end_date: yup.date().required("La fecha de fin es obligatoria"),
    location_text: yup.string().required("La ubicación es obligatoria"),
    logo: yup.mixed().test("logo", "El logo es obligatorio", (value) => {
        return value !== null && (value instanceof File || value instanceof Blob);
    }),
    shortname: yup.string().required("El nombre corto es obligatorio"),
    start_date: yup.date().required("La fecha de inicio es obligatoria"),
    tags: yup.array().of(
        yup.object({
            name: yup.string().required("El nombre del tag es obligatorio"),
            color: yup.string().required("El color del tag es obligatorio")
        })
    ),
    title: yup.string().required("El título es obligatorio")
});

const { handleSubmit } = useForm<InterfaceActivities>({ validationSchema: schema });

const { value: title } = useField<string>("title");
const { value: shortname } = useField<string>("shortname");
const { value: description } = useField<string>("description");
const { value: location_text } = useField<string>("location_text");
const { value: start_date } = useField<Date | null>("start_date");
const { value: end_date } = useField<Date | null>("end_date");
const { value: tags } = useField("tags");
const { value: logo } = useField<File | null>("logo");

// Corrección para inicializar las coordenadas con valores válidos por defecto
const location = ref({ lat: 0, lng: 0 });
const loading = ref(false);
const previewLogo = ref("");
const logoInput = ref<HTMLInputElement | null>(null);
const itemsEmail = ref<string[]>([]);
const searchQuery = ref<string>("");
const tagsOptions = ref<{ color: string, id: number, name: string }[]>([]);

const search = (event: AutoCompleteCompleteEvent) => {
    itemsEmail.value = [ "@gmail.com", "@hotmail.com", "@outlook.com" ].map((item) => event.query + item);
};

const settingsForm = ref({
    inscription: {
        send_email: false,
        show_tarifas: false,
        emails: [] as string[]
    }
});

// Add a new variable to manage selected tags separately
const selectedTags = ref<number[]>([]);

// Add a utility function to format dates
const formatDateTime = (date: Date | null): string => {
    if ( !date) return "";
    const pad = (n: number) => (n < 10 ? `0${ n }` : n);
    return `${ date.getFullYear() }-${ pad(date.getMonth() + 1) }-${ pad(date.getDate()) } ${ pad(date.getHours()) }:${ pad(date.getMinutes()) }:${ pad(date.getSeconds()) }`;
};

// Update the onSubmit function to parse dates before sending
const onSubmit = handleSubmit(async(values) => {
    loading.value = true;
    const formData = new FormData();
    Object.entries(values).forEach(([ key, value ]) => {
        if (key === "tags") {
            formData.append(key, JSON.stringify(value));
        } else if (key === "start_date" || key === "end_date") {
            formData.append(key, formatDateTime(value as Date));
        } else {
            formData.append(key, value);
        }
    });
    formData.append("location", JSON.stringify(location.value));
    formData.append("settings", JSON.stringify(settingsForm.value));

    try {

        const id = route.params.id as string | undefined;
        const isEdit = Boolean(id);
        const routeToSend = isEdit ? `activity/${ Number(id) }` : "activity";
        const method = isEdit ? Api.Put : Api.Post;
        const { response } = await method({ route: routeToSend, data: formData });
        if (response && [ 200, 201 ].includes(response.status)) {
            loading.value = false;
            useGlobalToast({ summary: isEdit ? "Actividad actualizada" : "Actividad creada", severity: "success" });
        }
    } catch (error) {
        console.error("Error al enviar el formulario", error);
    } finally {
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

// Corrección para manejar el clic en el input de archivo
const handleLogoInputClick = () => {
    if (logoInput.value) {
        logoInput.value.click();
    } else {
        console.error("El elemento de entrada de archivo no está disponible.");
    }
};

// Función para cargar datos del evento
const loadEventData = async() => {
    const eventId = route.params.id;
    if (eventId) {
        try {
            const { response } = await Api.Get({ route: `activity/${ eventId }` });
            if (response && response.status === 200) {
                const eventData = response.data;
                title.value = eventData.title;
                shortname.value = eventData.shortname;
                description.value = eventData.description;
                location_text.value = eventData.location_text;
                start_date.value = new Date(eventData.start_date);
                end_date.value = new Date(eventData.end_date);
                tags.value = eventData.tags;
                previewLogo.value = eventData.logo; // URL de la imagen

                // Convertir la URL del logo en un objeto File
                const responseLogo = await fetch(eventData.logo);
                const blob = await responseLogo.blob();
                logo.value = new File([ blob ], "logo.jpg", { type: blob.type });

                // Marcar el campo logo como "tocado" para vee-validate
                logoInput.value?.dispatchEvent(new Event("change"));
            }
        } catch (error) {
            console.error("Error al cargar los datos del evento:", error);
        }
    }
};

// Modificar handleFileChange para manejar archivos y URL
const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        logo.value = target.files[0];
        previewLogo.value = URL.createObjectURL(target.files[0]);
    } else {
        logo.value = null;
        previewLogo.value = "";
    }
};

const onGetAllTags = async() => {
    try {
        const { response } = await Api.Get({ route: "tag" });
        if (response && response.status === 200) {
            tagsOptions.value = response.data;
        }
    } catch (error) {
        console.error("Error al obtener los tags:", error);
    }
};

const onMapClick = (e: any) => {
    if (e.latlng && e.latlng.lat && e.latlng.lng) {
        const { lat, lng } = e?.latlng;
        location.value = { lat, lng };
    }
};

const onMarkedDragged = (e: { lat: number; lng: number }) => {
    if (e.lat && e.lng) {
        location.value = { lat: e.lat, lng: e.lng };
    }
};

// Agregar función para buscar ubicaciones usando la API de OpenStreetMap Nominatim
const searchLocation = async(query: string) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${ encodeURIComponent(query) }&format=json`);
        const results = await response.json();
        if (results.length > 0) {
            const { lat, lon } = results[0];
            location.value = { lat: parseFloat(lat), lng: parseFloat(lon) };
        } else {
            useGlobalToast({ summary: "Ubicación no encontrada", severity: "warn" });
        }
    } catch (error) {
        console.error("Error al buscar la ubicación:", error);
        useGlobalToast({ summary: "Error al buscar la ubicación", severity: "error" });
    }
};

// Update the MultiSelect binding to use the new variable for selection
// and synchronize it with the tags field in the form
watch(selectedTags, (newSelectedTags) => {
    tags.value = tagsOptions.value.filter(tag => newSelectedTags.includes(tag.id));
});

onMounted(async() => {
    await onGetAllTags();
    await onGetAllTags();
    await loadEventData();
    isEditMode.value = !!route.params.id;
});

</script>

<template>
    <div class="flex flex-col gap-6 p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <!-- Detalles -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-4 border-b pb-2">Detalles de la Actividad</h3>
                <ValidateFormItem label="Nombre" span="12" name="title" mark v-slot="{ error }">
                    <InputText v-model="title" :invalid="!!error" placeholder="Ingrese el nombre de la actividad" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Nombre corto" span="12" name="shortname" mark v-slot="{ error }">
                    <InputText v-model="shortname" :invalid="!!error" placeholder="Ingrese un nombre corto" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Descripción" span="12" name="description" mark v-slot="{ error }">
                    <Textarea v-model="description" :invalid="!!error" rows="4" placeholder="Describa la actividad" fluid/>
                </ValidateFormItem>
            </Card>

            <!-- Fechas -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-4 border-b pb-2">Fechas</h3>
                <ValidateFormItem label="Fecha de inicio" span="12" name="start_date" mark v-slot="{ error }">
                    <DatePicker v-model="start_date" :invalid="!!error" showTime placeholder="Seleccione la fecha de inicio" fluid/>
                </ValidateFormItem>
                <ValidateFormItem label="Fecha de fin" span="12" name="end_date" mark v-slot="{ error }">
                    <DatePicker v-model="end_date" :invalid="!!error" showTime placeholder="Seleccione la fecha de fin" fluid/>
                </ValidateFormItem>
            </Card>

            <!-- Ubicación -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-4 border-b pb-2">Ubicación</h3>
                <ValidateFormItem label="Nombre del lugar" span="12" name="location_text" mark v-slot="{ error }">
                    <InputText v-model="location_text" :invalid="!!error" placeholder="Ingrese el nombre del lugar" fluid/>
                </ValidateFormItem>
                <Card #content>
                    <h3 class="text-lg font-semibold mb-4">Buscar Ubicación</h3>
                    <div class="flex gap-2 mb-4">
                        <InputText v-model="searchQuery" placeholder="Ingrese una ubicación" fluid
                                   @keyup.enter="searchLocation(searchQuery)"/>
                        <Button label="Buscar" @click="() => searchLocation(searchQuery)"/>
                    </div>
                    <LMap style="height: 300px; width: 100%;" :zoom="13" :center="[location.lat, location.lng]" @click="onMapClick">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"/>
                        <LMarker :lat-lng="[location.lat, location.lng]" draggable @update:latLng="onMarkedDragged"/>
                    </LMap>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Lat: {{ location.lat }}, Lng: {{ location.lng }}</p>
                </Card>
            </Card>

            <!-- Tags -->
            <Card #content>
                <h3 class="text-lg font-semibold mb-4 border-b pb-2">Configuraciones</h3>
                <div class="align-items-form">
                    <ValidateFormItem label="Seleccionar Tags" span="12">
                        <MultiSelect v-model="selectedTags" :options="tagsOptions" optionValue="id" optionLabel="name" fluid display="chip"
                                     placeholder="Selecciona tags"/>
                    </ValidateFormItem>
                    <ValidateFormItem label="Enviar email de inscripción" span="6">
                        <Checkbox v-model="settingsForm.inscription.send_email" fluid/>
                    </ValidateFormItem>
                    <ValidateFormItem label="Mostrar tarifas" span="6">
                        <Checkbox v-model="settingsForm.inscription.show_tarifas" fluid/>
                    </ValidateFormItem>
                    <ValidateFormItem label="Emails de notificación" span="12" v-if="settingsForm.inscription.send_email">
                        <AutoComplete v-model="settingsForm.inscription.emails" fluid @complete="search" :suggestions="itemsEmail"
                                      :typeahead="true" multiple/>
                    </ValidateFormItem>
                </div>
                <Card #content>
                    <h3 class="text-lg font-semibold mb-4 border-b pb-2">Logo</h3>
                    <div class="relative">
                        <img :src="previewLogo" alt="Vista previa del logo" class="w-full h-48 object-cover rounded-md border"/>
                        <Button class="absolute top-2 right-2" label="Seleccionar" @click="handleLogoInputClick"/>
                        <input ref="logoInput" type="file" class="hidden" @change="handleFileChange"/>
                    </div>
                </Card>
            </Card>

            <!-- Logo -->

        </div>

        <!-- Submit -->
        <div class="flex justify-end mt-6">
            <Button :label="isEditMode ? 'Editar Actividad' : 'Crear Actividad'" severity="success" :loading="loading"
                    class="px-6 py-3 text-lg" @click="onSubmit"/>
        </div>
    </div>
</template>