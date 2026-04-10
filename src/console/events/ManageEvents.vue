<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { LMap, LTileLayer, LMarker } from "@maxel01/vue-leaflet";
import "leaflet/dist/leaflet.css";
import type { AutoCompleteCompleteEvent } from "primevue";
import { Api } from "@/api/connection.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isEditMode = ref(false);

const schema = yup.object({
    description: yup.string().required("La descripción es obligatoria"),
    end_date: yup.date().required("La fecha de fin es obligatoria"),
    location_text: yup.string().required("La ubicación es obligatoria"),
    logo: yup.mixed().test("logo", "El logo es obligatorio", (value) => {
        return value !== null && (value instanceof File || value instanceof Blob || typeof (value as unknown) === "string");
    }),
    shortname: yup.string()
        .required("El nombre corto es obligatorio")
        .matches(/^[a-zA-Z0-9]+$/, "Solo letras y números, sin espacios ni caracteres especiales"),
    start_date: yup.date().required("La fecha de inicio es obligatoria"),
    tags: yup.array().of(
        yup.object({
            name: yup.string().required("El nombre del tag es obligatorio"),
            color: yup.string().required("El color del tag es obligatorio")
        })
    ),
    title: yup.string().required("El título es obligatorio")
});

const { handleSubmit, resetForm } = useForm<InterfaceActivities>({ validationSchema: schema, initialValues: { is_active: true } });

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
const showMap = ref(false);
const hasLocationSelected = computed(() => location.value.lat !== 0 || location.value.lng !== 0);
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

// Update the onSubmit function to ensure send_email is always a boolean
const onSubmit = handleSubmit(async(values) => {
    loading.value = true;
    const formData = new FormData();
    Object.entries(values).forEach(([ key, value ]) => {
        if (key === "tags") {
            formData.append(key, JSON.stringify(value));
        } else if (key === "start_date" || key === "end_date") {
            formData.append(key, formatDateTime(value as Date));
        } else if (key === "logo") {
            // Solo enviar el logo si es un File (el usuario lo cambió)
            if (value instanceof File) {
                formData.append(key, value);
            }
        } else {
            formData.append(key, value);
        }
    });

    // Ensure send_email is a boolean
    settingsForm.value.inscription.send_email = Boolean(settingsForm.value.inscription.send_email);

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
            await router.push({ name: "console-events-list" });
            useGlobalToast({ summary: isEdit ? "Actividad actualizada" : "Actividad creada", severity: "success", life: 7000 });
            ClearForm();
        }
    } catch (error) {
        console.error("Error al enviar el formulario", error);
    } finally {
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

// Add a function to reset the form and route parameter
const ClearForm = () => {
    resetForm();
    tags.value = [];
    previewLogo.value = "";
    selectedTags.value = [];
    settingsForm.value = {
        inscription: {
            send_email: false,
            show_tarifas: false,
            emails: []
        }
    };
    location.value = { lat: 0, lng: 0 };
    showMap.value = false;
};

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
                selectedTags.value = eventData.tags.map((t: any) => t.id);
                previewLogo.value = eventData.logo;
                logo.value = eventData.logo;
                location.value = {
                    lat: eventData.location.lat,
                    lng: eventData.location.lng
                };

                // Ajustar settingsForm para manejar send_email correctamente
                settingsForm.value = {
                    inscription: {
                        send_email: Boolean(eventData.settings.inscription.send_email),
                        show_tarifas: Boolean(eventData.settings.inscription.show_tarifas),
                        emails: eventData.settings.inscription.emails || []
                    }
                };

                // Convertir la URL del logo en un objeto File
                try {
                    const responseLogo = await fetch(eventData.logo);
                    const blob = await responseLogo.blob();
                    const fileName = eventData.logo.split("/").pop() || "logo.jpg";
                    logo.value = new File([ blob ], fileName, { type: blob.type });
                } catch (logoError) {
                    // Si falla la conversión (ej. CORS), logo.value queda como string URL
                    console.error("Error al convertir el logo en un objeto File:", logoError);
                }
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

// Sanitizar shortname en tiempo real: solo letras y números
watch(() => shortname.value, (val) => {
    if (val) {
        const sanitized = val.replace(/[^a-zA-Z0-9]/g, "");
        if (sanitized !== val) shortname.value = sanitized;
    }
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
                <ValidateFormItem label="Nombre corto" span="12" name="shortname" mark v-slot="{ error }"
                                  helpText="Solo letras y números, sin espacios ni caracteres especiales">
                    <InputText v-model="shortname" :invalid="!!error" placeholder="Ej: camp2025" fluid/>
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

                <!-- Nombre del lugar (texto visible para el público) -->
                <div class="mb-4">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <i-material-symbols-location-on-outline class="inline text-base align-middle mr-1"/>
                        Nombre visible del lugar donde se realizará la actividad (ej. "Centro de Convenciones", "Iglesia Central").
                    </p>
                    <ValidateFormItem label="Nombre del lugar" span="12" name="location_text" mark v-slot="{ error }">
                        <InputText v-model="location_text" :invalid="!!error" placeholder="Ej: Coliseo Gran Chimú, Moyobamba" fluid/>
                    </ValidateFormItem>
                </div>

                <!-- Resumen de coordenadas seleccionadas -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium">Coordenadas en el mapa</span>
                        <Tag v-if="hasLocationSelected" severity="success" value="Seleccionada" icon="pi pi-check"/>
                        <Tag v-else severity="warn" value="Sin seleccionar" icon="pi pi-exclamation-triangle"/>
                    </div>

                    <!-- Panel de resumen cuando hay coordenadas -->
                    <div v-if="hasLocationSelected && !showMap"
                         class="flex items-center justify-between rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
                        <div class="flex items-center gap-3">
                            <i-material-symbols-location-on-rounded class="text-2xl text-green-600 dark:text-green-400"/>
                            <div>
                                <p class="text-sm font-medium">{{ location_text || 'Ubicación seleccionada' }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    Lat: {{ location.lat.toFixed(6) }}, Lng: {{ location.lng.toFixed(6) }}
                                </p>
                            </div>
                        </div>
                        <Button label="Cambiar" icon="pi pi-map" severity="secondary" size="small" outlined
                                @click="showMap = true"/>
                    </div>

                    <!-- Panel vacío cuando no hay coordenadas -->
                    <div v-if="!hasLocationSelected && !showMap"
                         class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 p-6 text-center">
                        <i-material-symbols-location-on-outline class="text-4xl text-gray-400 mb-2"/>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Aún no has seleccionado una ubicación en el mapa.
                        </p>
                        <Button label="Seleccionar en el mapa" icon="pi pi-map-marker" severity="info" size="small"
                                @click="showMap = true"/>
                    </div>
                </div>

                <!-- Mapa colapsable -->
                <div v-if="showMap" class="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/20">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-semibold flex items-center gap-2">
                            <i class="pi pi-map"/>
                            Buscar y seleccionar ubicación
                        </h4>
                        <Button icon="pi pi-times" severity="secondary" text rounded size="small"
                                @click="showMap = false" v-tooltip="'Cerrar mapa'"/>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Busca una dirección o haz clic / arrastra el marcador en el mapa para seleccionar las coordenadas exactas.
                    </p>
                    <div class="flex gap-2 mb-3">
                        <InputText v-model="searchQuery" placeholder="Buscar dirección o ciudad..." fluid
                                   @keyup.enter="searchLocation(searchQuery)"/>
                        <Button label="Buscar" icon="pi pi-search" @click="() => searchLocation(searchQuery)"/>
                    </div>
                    <LMap style="height: 300px; width: 100%; border-radius: 8px;" :zoom="13"
                          :center="[location.lat, location.lng]" @click="onMapClick">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"/>
                        <LMarker :lat-lng="[location.lat, location.lng]" draggable @update:latLng="onMarkedDragged"/>
                    </LMap>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Lat: {{ location.lat.toFixed(6) }}, Lng: {{ location.lng.toFixed(6) }}
                        </p>
                        <Button v-if="hasLocationSelected" label="Confirmar ubicación" icon="pi pi-check" severity="success"
                                size="small" @click="showMap = false"/>
                    </div>
                </div>
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
                        <Checkbox v-model="settingsForm.inscription.send_email" binary fluid/>
                    </ValidateFormItem>
                    <ValidateFormItem label="Mostrar tarifas" span="6">
                        <Checkbox v-model="settingsForm.inscription.show_tarifas" binary fluid/>
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