<script setup lang="ts">

/* Imports */
import { Api } from "@/api/connection";
import { ref, h, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useModal } from "@/composables/useModal.ts";
import type { InterfaceUsers, UsersResponseMembers } from "@/types/interfaceUsers.ts";
import addUsers from "./addUsers.vue";
import changePassword from "./changePassword.vue";
import { page_config } from "@/assets/page_config.json";

/* Defaults Variables */
const dataUsers = ref<InterfaceUsers[]>([]);
const loading = ref<boolean>(false);
const { openModal, closeModal } = useModal();

/**
 * Carga datos de la API de usuarios.
 *
 * @async
 * @function loadUserList
 * @description Realiza una llamada a la API para obtener una lista de usuarios basada en la paginación.
 * @params {Object} options - Opciones para la solicitud de la API.
 * @params {number} options.limit - El límite de usuarios a retornar.
 * @params {number} options. Offset - El desplazamiento de inicio para la consulta de usuarios.
 * @returns {Promise<void>} - La promesa que representa el proceso de carga de datos.
 */
const loadUserList = useDebounceFn(async(): Promise<void> => {
    loading.value = true;
    const { response }: UsersResponseMembers = await Api.Get({
        params: {
            activity_shortname: page_config.eventID
        },
        route: "user"
    });
    if (response && response.status === 200) {
        dataUsers.value = response.data.results;
        loading.value = false;
    }
}, 250);

const addParametersUserModal = (data: InterfaceUsers): void => {
    openModal({
        breakpoints: { "1400px": "94vw", "1100px": "96vw", "640px": "99vw" },
        component: h(addUsers, {
            closeModal,
            refreshData: () => loadUserList(),
            formData: <InterfaceUsers> {
                ...data
            }
        }),
        header: "Editar usuario",
        width: "55vw"
    });
};

const addParametersChangePassword = (data: InterfaceUsers): void => {
    openModal({
        component: h(changePassword, {
            closeForm: closeModal,
            userID: data.id
        }),
        header: `Cambiar contraseña de ${ data.login_name }`,
        width: "35vw"
    });
};

onMounted(async() => {
    await loadUserList();
});

defineExpose({ loadUserList });

</script>

<template>
    <DataTable size="small" :value="dataUsers" scroll-height="65vh" scrollable tableStyle="min-width: 90rem;" lazy :loading="loading"
               dataKey="id">
        <template #empty>
            <empty-table/>
        </template>
        <template #loading>
            <loading-page/>
        </template>
        <Column style="width: 10%" field="login_name" header="Usuario"/>
        <Column style="width: 10%" :field="(dt)=>`${dt.names} ${dt.lastname}`" header="Nombres"/>
        <Column style="width: 10%" field="email" header="Correo"/>
        <Column style="width: 10%" field="profile_description" header="Perfil"/>
        <Column style="width: 10%" field="activity_description" header="Actividad" #body="{ data }">
            {{ data.activity_description ?? "Envía el nombre de la actividad pues joshelito." }}
        </Column>
        <Column style="width: 5%" header="Estado" field="is_active" #body="{ data }">
            <Message size="small" :severity="data.is_active? 'success' : 'error'">
                {{ data.is_active ? "Activo" : "Inactivo" }}
            </Message>
        </Column>
        <Column style="width: 5%" header="Acciones" #body="{ data }">
            <div class="flex items-center justify-center space-x-1">
                <Button severity="warn" v-tooltip="'Editar Usuario'" @click="addParametersUserModal(data)"
                        class="h-7 !w-7" #icon>
                    <i-material-symbols-person-edit-rounded class="text-xl"/>
                </Button>
                <Button severity="info" v-tooltip="'Cambiar Contraseña'" @click="addParametersChangePassword(data)"
                        class="h-7 !w-7" #icon>
                    <i-material-symbols-lock class="text-xl"/>
                </Button>
                <Button severity="danger" v-tooltip="'Bloquear usuario'" @click="addParametersUserModal(data)"
                        class="h-7 !w-7" #icon>
                    <i-material-symbols-block-outline class="text-xl"/>
                </Button>
            </div>
        </Column>
    </DataTable>
</template>
