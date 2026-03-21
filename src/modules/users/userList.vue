<script setup lang="ts">

/* Imports */
import { Api } from "@/api/connection";
import { ref, h, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { useModal } from "@/composables/useModal.ts";
import type { InterfaceUsers, UsersResponseMembers } from "@/types/interfaceUsers.ts";
import addUsers from "./addUsers.vue";
import changePassword from "./changePassword.vue";

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
    const { response }: UsersResponseMembers = await Api.Get({ route: "user" });
    if (response && response.status === 200) {
        dataUsers.value = response.data.results;
        loading.value = false;
    }
}, 250);

const addParametersUserModal = (data: InterfaceUsers): void => {
    openModal({
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
        header: `Cambiar contraseña de ${ data.username }`,
        width: "35vw"
    });
};

onMounted(async() => {
    await loadUserList();
});

defineExpose({ loadUserList });

</script>

<template>
    <DataTable size="small" :value="dataUsers" scroll-height="65vh" scrollable tableStyle="min-width: 80rem;" lazy :loading="loading"
               dataKey="id">
        <template #empty>
            <empty-table/>
        </template>
        <template #loading>
            <loading-page/>
        </template>
        <Column style="width: 10%" field="username" header="Usuario"/>
        <Column style="width: 10%" field="names" header="Nombres"/>
        <Column style="width: 10%" field="email" header="Correo"/>
        <Column style="width: 10%" field="profile_description" header="Perfil"/>
        <Column style="width: 5%" header="Estado" field="is_active" #body="{ data }">
            <Message size="small" :severity="data.is_active? 'success' : 'error'">
                {{ data.is_active ? "Activo" : "Inactivo" }}
            </Message>
        </Column>
        <Column style="width: 5%" header="Acciones" #body="{ data }">
            <div class="flex items-center justify-center space-x-1">
                <Button size="small" severity="warn" v-tooltip="'Editar Usuario'" @click="addParametersUserModal(data)"
                        class="h-6 !w-6" #icon>
                    <i-material-symbols-person-edit-rounded/>
                </Button>
                <Button size="small" severity="info" v-tooltip="'Cambiar Contraseña'" @click="addParametersChangePassword(data)"
                        class="h-6 !w-6" #icon>
                    <i-material-symbols-lock/>
                </Button>
                <Button size="small" severity="danger" v-tooltip="'Bloquear usuario'" @click="addParametersUserModal(data)"
                        class="h-6 !w-6" #icon>
                    <i-material-symbols-block-outline/>
                </Button>
            </div>
        </Column>
    </DataTable>
</template>
