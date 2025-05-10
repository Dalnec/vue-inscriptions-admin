<script setup lang="ts">

/* Imports */
import addUsers from "./addUsers.vue";
import changePassword from "./changePassword.vue";
import { ref, h, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { Api } from "@/api/connection";
import type { InterfaceUsers, UsersResponseMembers } from "@/modules/users/interfaceUsers.ts";
import type { ModalParameters } from "@/composables/parametersModalType.ts";

/* Defaults Variables */
const dataUsers = ref<InterfaceUsers[]>([]);
const loading = ref<boolean>(false);

/**
 * @params {Function} closeModal - Function that returns visible of the modal.
 * @returns {void} - Change the visibility of the modal
 */
const closeModal = (): boolean => parametersModal.value.visible = false;

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
    if (response.status === 200) {
        dataUsers.value = response.data.results;
        loading.value = false;
    }
}, 250);

/**
 * Initial values that are passed to the modal
 */
const parametersModal = ref<ModalParameters>({
    component: {},
    footer: null,
    header: "",
    visible: false,
    width: "30vw"
});

const addParametersUserModal = (data: InterfaceUsers): void => {
    parametersModal.value = {
        component: h(addUsers, {
            closeModal,
            refreshData: () => loadUserList(),
            formData: <InterfaceUsers> {
                ...data
            }
        }),
        footer: "",
        header: "Editar usuario",
        visible: true,
        width: "55vw"
    };
};

const addParametersChangePassword = (data: InterfaceUsers): void => {
    parametersModal.value = {
        component: h(changePassword, {
            closeForm: closeModal,
            userID: data.id
        }),
        footer: "",
        header: `Cambiar contraseña de ${ data.username }`,
        visible: true,
        width: "35vw"
    };
};

onMounted(async() => {
    await loadUserList();
});

defineExpose({ loadUserList });

</script>

<template>
    <div class="relative mb-2">
        <i-ri-search-line class="absolute top-2/4 left-3 -mt-2.5 text-surface-400 dark:text-surface-600"/>
        <InputText placeholder="Buscar usuario" class="!pl-10 max-w-96" fluid/>
    </div>
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
        <Column style="width: 5%" header="Estado" field="is_active">
            <template #body="{data}">
                <Message size="small" :severity="data.is_active? 'success' : 'error'">
                    {{ data.is_active ? "Activo" : "Inactivo" }}
                </Message>
            </template>
        </Column>
        <Column style="width: 5%" header="Acciones">
            <template #body="{data}">
                <div class="flex items-center justify-center space-x-1">
                    <Button size="small" severity="warn" v-tooltip.top="'Editar Usuario'" @click="addParametersUserModal(data)"
                            class="h-6 !w-6">
                        <template #icon>
                            <i-tabler-user-edit/>
                        </template>
                    </Button>
                    <Button size="small" severity="info" v-tooltip.top="'Cambiar Contraseña'" @click="addParametersChangePassword(data)"
                            class="h-6 !w-6">
                        <template #icon>
                            <i-material-symbols-lock/>
                        </template>
                    </Button>
                    <Button size="small" severity="danger" v-tooltip.top="'Bloquear usuario'" @click="addParametersUserModal(data)"
                            class="h-6 !w-6">
                        <template #icon>
                            <i-solar-user-block-outline/>
                        </template>
                    </Button>
                </div>
            </template>
        </Column>
    </DataTable>
    <modal-component ref="modal" :parameters="parametersModal"/>
</template>
