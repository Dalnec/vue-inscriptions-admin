<script setup lang="ts">

/* Imports */
import EmptyTable from "@/components/emptyTable.vue";
import LoadingData from "@/components/loadingPage.vue";
import ModalComponent from "@/components/modalComponent.vue";
import registerMembers from "@/modules/registers/registerMembers.vue";
import { type ModalParameters } from "@/composables/parametersModalType";
import { ref, h, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { Api } from "@/api/connection";
import type { DataTablePageEvent } from "primevue";
import type { InscriptionsMembers, InterfaceResponseInscriptions } from "@/modules/inscriptions/inscriptionsMembers.ts";
import type { InterfaceMembers } from "@/composables/interfaceMembers.ts";
import showVoucherFile from "@/components/showVoucherFile.vue";
import changeAmount from "@/modules/registers/changeAmount.vue";

/* Defaults Variables */
const dataMembers = ref<InscriptionsMembers[]>([]);
const loading = ref<boolean>(false);
const rows = ref(25);
const currentPage = ref(1);
const totalRecords = ref(0);

const onPageChange = async(event: DataTablePageEvent) => {
    currentPage.value = event.page + 1;
    rows.value = event.rows;
    await loadInscriptionsList();
};

/**
 * @params {Function} closeModal - Function that returns visible of the modal.
 * @returns {void} - Change the visibility of the modal
 */
const closeModal = (): boolean => parametersModal.value.visible = false;

/**
 * Carga datos de la API de usuarios.
 *
 * @async
 * @function loadInscriptionsList
 * @description Realiza una llamada a la API para obtener una lista de usuarios basada en la paginación.
 * @params {Object} options - Opciones para la solicitud de la API.
 * @params {number} options.limit - El límite de usuarios a retornar.
 * @params {number} options. Offset - El desplazamiento de inicio para la consulta de usuarios.
 * @returns {Promise<void>} - La promesa que representa el proceso de carga de datos.
 */
const loadInscriptionsList = useDebounceFn(async(): Promise<void> => {
    loading.value = true;
    const { response }: InterfaceResponseInscriptions = await Api.Get({
        route: "inscription", params: {
            page: currentPage.value,
            page_size: rows.value
        }
    });
    if (response && response.status === 200) {
        dataMembers.value = response.data.results;
        loading.value = false;
        totalRecords.value = response.data.count;
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

const addParametersUserModal = (data: InscriptionsMembers): void => {
    parametersModal.value = {
        component: h(registerMembers, {
            closeModal,
            refreshData: () => loadInscriptionsList(),
            formData: <InterfaceMembers> { ...data.person }
        }),
        footer: "",
        header: `Editar: ${ data.person.names } ${ data.person.lastnames }`,
        visible: true,
        width: "40vw"
    };
};

const onShowVoucher = (data: InscriptionsMembers): void => {
    parametersModal.value = {
        component: h(showVoucherFile, {
            closeModal,
            imgFile: data.group.voucherfile
        }),
        footer: "",
        header: `Voucher de: ${ data.person.names }`,
        visible: true,
        width: "35vw"
    };
};

const onChangeAmount = (data: InscriptionsMembers): void => {
    parametersModal.value = {
        component: h(changeAmount, {
            closeModal,
            formData: data,
            refreshData: () => loadInscriptionsList()
        }),
        header: `Cambiar monto: ${ data.person.names }`,
        visible: true,
        width: "35vw"
    };
};

onMounted(async() => {
    await loadInscriptionsList();
});

defineExpose({ loadInscriptionsList });

</script>

<template>
    <div class="relative mb-2">
        <i-ri-search-line class="absolute top-2/4 left-3 -mt-2.5 text-surface-400 dark:text-surface-600"/>
        <InputText placeholder="Buscar usuario" class="!pl-10 max-w-96" fluid/>
    </div>
    <DataTable size="small" :value="dataMembers" scroll-height="65vh" scrollable tableStyle="min-width: 100rem;" lazy :loading dataKey="id"
               :rows-per-page-options="[25, 50, 100]" :totalRecords paginator :rows :first="currentPage * rows - rows" @page="onPageChange">
        <template #empty>
            <empty-table/>
        </template>
        <template #loading>
            <loading-data/>
        </template>
        <Column style="width: 15%" field="person.doc_num" header="DNI/Nombres">
            <template #body="{data}">
                <p class="font-bold">{{ data.person.doc_num }}</p>
                <p>{{ data.person.names }}, {{ data.person.lastnames }}</p>
            </template>
        </Column>
        <Column style="width: 4%" field="person.phone" header="Teléfono"/>
        <Column style="width: 3%" field="person.gender" header="Género"/>
        <Column style="width: 10%" field="person.church_description" header="Iglesia"/>
        <Column style="width: 4%" field="group.id" header="# Grupo"/>
        <!--        <Column style="width: 10%" field="person.jobStart" header="Cod. Grupo"/>-->
        <Column style="width: 5%" header="M. Pago">
            <template #body="{data}">
                <div class="flex gap-2 items-center justify-between">
                    <p class="font-bold">{{ data.group.paymentmethod.description }}</p>
                    <Button v-if="data.group.paymentmethod.id !== 1" @click="onShowVoucher(data)">
                        <template #icon>
                            <i-lets-icons-ticket-alt/>
                        </template>
                    </Button>
                </div>
            </template>
        </Column>
        <Column style="width: 4%" header="Monto">
            <template #body="{data}">
                {{ !!data?.amount ? `S/ ${ data?.amount }` : "-" }}
            </template>
        </Column>
        <Column style="width: 10%" field="observations" header="Observaciones"/>
        <Column style="width: 4%" header="Estado" field="active">
            <template #body="{data}">
                <Message size="small" :severity="data.status === 'E' ? 'error' : data.status === 'P' ? 'warn' : 'success'">
                    {{ data.status_description }}
                </Message>
            </template>
        </Column>
        <Column style="width: 3%" header="Acciones">
            <template #body="{data}">
                <div class="flex items-center justify-center space-x-1">
                    <Button size="small" severity="warn" v-tooltip.top="'Editar persona'" @click="addParametersUserModal(data)"
                            class="h-6 !w-6">
                        <template #icon>
                            <i-tabler-user-edit/>
                        </template>
                    </Button>
                    <Button size="small" severity="info" v-tooltip.top="'Cambiar monto'" @click="onChangeAmount(data)"
                            class="h-6 !w-6">
                        <template #icon>
                            <i-ic-round-attach-money/>
                        </template>
                    </Button>
                </div>
            </template>
        </Column>
    </DataTable>
    <modal-component ref="modal" :parameters="parametersModal"/>
</template>
