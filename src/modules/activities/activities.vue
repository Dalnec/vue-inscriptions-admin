<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { ref, onMounted, h } from "vue";
import { useModal } from "@/composables/useModal.ts";
import { useRoute } from "vue-router";
import toastEvent from "@/composables/toastEvent.ts";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";
import ActivityForm from "@/modules/activities/ActivityForm.vue";
import router from "@/router";

const dataActivities = ref<InterfaceActivities[]>([]);
const loading = ref<boolean>(false);
const route = useRoute();

const { openModal, closeModal } = useModal();

const loadActivities = async(): Promise<void> => {
    loading.value = true;
    const { response } = await Api.Get({ route: "activity", params: { page_size: 100 } });
    if (response && response.status === 200) {
        dataActivities.value = response.data.results || response.data;
        loading.value = false;
    }
};

onMounted(async() => {
    await loadActivities();
});

const onManageActivity = (activity?: InterfaceActivities) => {
    openModal({
        component: h(ActivityForm, {
            closeModal,
            formData: activity?.id ? { ...activity } : undefined,
            refreshData: loadActivities
        }),
        header: activity?.id ? "Editar Actividad" : "Nueva Actividad",
        width: "60vw"
    });
};

const toggleActivityStatus = async(activity: InterfaceActivities) => {
    try {
        const route = `activity/${ activity.id }`;
        const { response } = await Api.Put({
            route,
            data: { ...activity, is_active: !activity.is_active }
        });
        if (response && (response.status === 200 || response.status === 201)) {
            toastEvent({
                severity: "success",
                summary: "Actividad actualizada",
                detail: `Actividad ${ !activity.is_active ? "activada" : "desactivada" } correctamente`
            });
            await loadActivities();
        }
    } catch (error) {
        toastEvent({
            severity: "error",
            summary: "Error",
            detail: "Error al cambiar el estado de la actividad"
        });
    }
};

// Función para formatear fechas
const formatDate = (date: Date): string => {
    if ( !date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const onRedirectEvent = async(shortname: string) => {
    await router.push({ name: "newRegister", params: { slug: shortname } });
};

// Agregar función para redirigir al formulario de edición
const onEditActivity = async(id: number) => {
    await router.push({ name: "console-events", params: { id } });
};

</script>

<template>
    <Card #content>
        <div class="align-header mb-4">
            <p class="p-card-title">Actividades</p>
            <Button label="Nueva Actividad" icon="pi pi-plus" @click="onManageActivity()" class="p-button-primary"/>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
            <Skeleton height="150px" class="mb-4"/>
            <Skeleton height="150px" class="mb-4"/>
            <Skeleton height="150px" class="mb-4"/>
        </div>

        <!-- Empty State -->
        <div v-else-if="dataActivities.length === 0" class="text-center py-12">
            <EmptyTable/>
        </div>

        <!-- Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="activity in dataActivities" :key="activity.id!"
                 class="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-shadow p-5">

                <!-- Activity Header -->
                <div class="flex items-center justify-between mb-1">
                    <h3 class="text-base font-semibold text-surface-900 dark:text-surface-0">
                        {{ activity.title }}
                    </h3>
                    <div class="flex gap-2">
                        <Button v-tooltip="'Editar actividad'" class="!w-10" @click="onEditActivity(activity.id!)" severity="info"
                                size="small" v-if="(route.name as string).startsWith('console')" #icon>
                            <i-material-symbols-edit-document-rounded/>
                        </Button>
                        <Button class="h-10" @click="onRedirectEvent(activity.shortname)"
                                v-if="(route.name as string).startsWith('console')" #icon>
                            <i-material-symbols-visibility-rounded class="text-lg"/>
                        </Button>
                    </div>
                </div>
                <!-- Location -->
                <div class="flex items-center gap-2 text-surface-600 dark:text-surface-400 mb-2 text-xs">
                    <i-material-symbols-location-on-outline class="text-sm"/>
                    <span class="truncate">{{ activity.location_text }}</span>
                </div>

                <!-- Description -->
                <p class="text-surface-700 dark:text-surface-300 text-xs mb-3 line-clamp-2">
                    {{ activity.description }}
                </p>

                <!-- Dates -->
                <div class="space-y-1 text-xs text-surface-600 dark:text-surface-400 mb-4 bg-surface-50 dark:bg-surface-700 p-2 rounded">
                    <div class="flex items-center gap-2">
                        <i-material-symbols-calendar-today-outline class="text-sm flex-shrink-0"/>
                        <span>Inicio: {{ formatDate(activity.start_date!) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i-material-symbols-calendar-today-outline class="text-sm flex-shrink-0"/>
                        <span>Fin: {{ formatDate(activity.end_date!) }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 justify-between items-center">
                    <div class="flex gap-1">
                        <Button v-tooltip="'Editar actividad'" @click="onManageActivity(activity)" severity="info" size="small"
                                v-if="!(route.name as string).startsWith('console')"
                                #icon>
                            <i-material-symbols-edit-document-rounded/>
                        </Button>
                        <Button size="small" :v-tooltip="activity.is_active ? 'Desactivar actividad' : 'Activar actividad'"
                                @click="toggleActivityStatus(activity)" :severity="activity.is_active ? 'warning' : 'success'" #icon>
                            <i-material-symbols-check-box-rounded v-if="activity.is_active"/>
                            <i-material-symbols-cancel-outline-rounded v-else/>
                        </Button>
                    </div>
                    <Tag :value="activity.is_active ? 'Activa' : 'Inactiva'"
                         :severity="activity.is_active ? 'success' : 'secondary'"
                         class="text-xs"/>
                </div>
            </div>
        </div>
    </Card>
</template>

<style scoped>

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

</style>
