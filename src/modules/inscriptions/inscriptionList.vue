<script setup lang="ts">

/* Imports */
import { Api } from "@/api/connection";
import { ref, h, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { exportInscriptionsToExcel } from "@/composables/generateExcelMembers.ts";
import { useModal } from "@/composables/useModal.ts";
import { useRoute } from "vue-router";
import useGlobalToast from "@/composables/toastEvent.ts";
import { type DataTablePageEvent, useConfirm } from "primevue";
import type { InscriptionsMembers, InterfaceActionsInscriptions, InterfaceResponseInscriptions } from "@/modules/inscriptions/inscriptionsMembers.ts";
import type { InterfaceMembers } from "@/types/interfaceMembers.ts";
import type { InterfaceActivities } from "@/types/interfaceActivities.ts";
import { storeActivityActive, storeActivities } from "@/stores/generalInfoStore.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData.ts";
import showVoucherFile from "@/components/showVoucherFile.vue";
import changeAmount from "@/modules/registers/changeAmount.vue";
import changeVoucher from "@/components/changeVoucher.vue";
import notifyMember from "@/components/notifyMember.vue";
import addObservations from "@/components/addObservations.vue";
import registerMembers from "@/modules/registers/registerMembers.vue";

const route = useRoute();
/* Defaults Variables */
const dataMembers = ref<InscriptionsMembers[]>([]);
const loading = ref<boolean>(false);
const rows = ref(25);
const currentPage = ref(1);
const totalRecords = ref(0);
const useStoreActivityActive = storeActivityActive();
const menus = ref<Record<number, any>>({});
const confirm = useConfirm();
const search = ref("");
const userDataStore = useUserDataConfigStore();
const userDataValue = userDataStore.userData.user;
const { closeModal, openModal } = useModal();
const activitySelected = ref<InterfaceActivities>();

const onPageChange = async(event: DataTablePageEvent) => {
    currentPage.value = event.page + 1;
    rows.value = event.rows;
    await loadInscriptionsList();
};

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
        params: {
            activity: activitySelected.value?.id,
            page: currentPage.value,
            page_size: rows.value,
            search: search.value
        },
        route: "inscription"
    });
    if (response && response.status === 200) {
        dataMembers.value = response.data.results;
        loading.value = false;
        totalRecords.value = response.data.count;
    }
}, 250);

const addParametersUserModal = (data: InscriptionsMembers): void => {
    openModal({
        component: h(registerMembers, {
            closeModal,
            refreshData: () => loadInscriptionsList(),
            formData: <InterfaceMembers> { ...data.person }
        }),
        footer: "",
        header: `Editar: ${ data.person.names } ${ data.person.lastnames }`,
        width: "40vw"
    });
};

const onShowVoucher = (data: InscriptionsMembers): void => {
    openModal({
        component: h(showVoucherFile, {
            closeModal,
            imgFile: data.group.voucherfile
        }),
        footer: "",
        header: `Voucher de: ${ data.person.names }`,
        width: "25vw"
    });
};

const onChangeVoucher = (data: InscriptionsMembers): void => {
    openModal({
        component: h(changeVoucher, {
            closeModal,
            formData: data,
            refreshData: () => loadInscriptionsList()
        }),
        footer: "",
        header: `Voucher de: ${ data.person.names }`,
        width: "25vw"
    });
};

const onChangeAmount = (data: InscriptionsMembers): void => {
    openModal({
        component: h(changeAmount, {
            closeModal,
            formData: data,
            refreshData: () => loadInscriptionsList()
        }),
        header: `Cambiar monto: ${ data.person.names }`,
        width: "35vw"
    });
};

const onNotifyMember = (data: InscriptionsMembers): void => {
    openModal({
        component: h(notifyMember, {
            closeModal,
            member: data
        }),
        header: `Enviar correo a: ${ data.person.names }`,
        width: "35vw"
    });
};

const onAddObservationMember = (data: InscriptionsMembers): void => {
    openModal({
        component: h(addObservations, {
            closeModal,
            formData: data,
            refreshData: () => loadInscriptionsList()
        }),
        header: `Agregar detalle a: ${ data.person.names }`,
        width: "35vw"
    });
};

const onChangeStatusMember = async(data: InscriptionsMembers, status: string, isForDelete?: boolean): Promise<void> => {
    if (isForDelete) {
        confirm.require({
            message: `¿Estas seguro de eliminar a ${ data.person.names } ${ data.person.lastnames }?`,
            header: "Confirmación",
            rejectProps: {
                label: "Cancelar",
                severity: "secondary",
                outlined: true
            },
            acceptProps: {
                label: "Eliminar"
            },
            accept: async() => {
                const { response }: InterfaceActionsInscriptions = await Api.Destroy({ route: `inscription/${ data.id }` });
                if (response && response.status === 204) {
                    await loadInscriptionsList();
                    useGlobalToast({ severity: "info", summary: "Éxito", detail: "Eliminado correctamente", life: 3000 });
                }
            },
            reject: () => {
                useGlobalToast({ severity: "error", summary: "Cancelado", detail: "Acción Cancelada", life: 3000 });
            }
        });
    } else {
        // const { response }: InterfaceActionsInscriptions = await Api.Put({ route: `inscription/${ data.id }`, data: { ...data, status } });
        const { response }: InterfaceActionsInscriptions = await Api.Post({
            route: `inscription-groups/${ data.group.id }/confirm-payment`, data: {}
        });
        if (response && response.status === 200) {
            await loadInscriptionsList();
            useGlobalToast({ detail: "Estado actualizado correctamente", severity: "success" });
        }
    }
};

const optionsActions = (data: InscriptionsMembers) => {
    const options = [
        {
            label: "Agregar Obs.", value: 1, command: () => {
                onAddObservationMember(data);
            }, class: IconMaterialSymbolsCircleNotifications as unknown
        },
        {
            label: "Notificar", value: 2, command: () => {
                onNotifyMember(data);
            }, class: IconMaterialSymbolsCircleNotifications as unknown
        },
        {
            label: "Confirmar", value: 3, command: () => {
                onChangeStatusMember(data, "C");
            }, class: IconMaterialSymbolsBookmarkCheck as unknown
        },
        {
            label: "Rechazar", value: 4, command: () => {
                onChangeStatusMember(data, "R");
            }, class: IconMaterialSymbolsPersonRemove as unknown
        }
    ];
    if (userDataValue.profile_description === "ADMINISTRADOR" || userDataValue.is_superuser) {
        options.unshift({
            label: "Cambiar Voucher", value: 5, command: () => {
                onChangeVoucher(data);
            }, class: IconMaterialSymbolsAutoDeleteOutlineRounded as unknown
        });
    }
    if (userDataValue.profile_description === "ADMINISTRADOR" || userDataValue.is_superuser) {
        options.push({
            label: "Eliminar", value: 6, command: () => {
                onChangeStatusMember(data, "", true);
            }, class: IconMaterialSymbolsAutoDeleteOutlineRounded as unknown
        });
    }
    return options;
};

const toggle = (event: MouseEvent, id: number) => {
    if (menus.value[id]) menus.value[id].toggle(event);
};

const addDataToGenerateExcel = useDebounceFn(async(): Promise<void> => {
    loading.value = true;
    const { response }: InterfaceResponseInscriptions = await Api.Get({
        params: {
            activity: useStoreActivityActive.activityId,
            page: 1,
            page_size: 120417,
            search: search.value
        },
        route: "inscription"
    });
    if (response && response.status === 200) {
        await exportInscriptionsToExcel(response.data.results);
        loading.value = false;
    }
}, 250);

onMounted(async() => {
    await storeActivities().getActivities();
    activitySelected.value = storeActivities().activities.find(activity => activity.shortname === route.params.slug);
    await loadInscriptionsList();
});

defineExpose({ loadInscriptionsList });

</script>

<template>
    <div class="align-header mb-4">
        <InputText placeholder="Buscar usuario" class="max-w-96" fluid v-model="search"
                   @update:model-value="loadInscriptionsList"/>
        <Button label="Descargar Excel" @click="addDataToGenerateExcel()" #icon>
            <i-material-symbols-sheets/>
        </Button>
    </div>
    <DataTable size="small" :value="dataMembers" scroll-height="65vh" scrollable tableStyle="min-width: 110rem;" lazy :loading dataKey="id"
               :rows-per-page-options="[25, 50, 100]" :totalRecords paginator :rows :first="currentPage * rows - rows" @page="onPageChange"
               :paginator-template="{
                   '640px': 'PrevPageLink PageLinks NextPageLink',
                   '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                   '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                   default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'}">
        <template #empty>
            <empty-table/>
        </template>
        <template #loading>
            <LoadingPage/>
        </template>
        <Column style="width: 15%" field="person.doc_num" header="DNI/Nombres" #body="{ data }">
            <p class="font-bold">{{ data.person.doc_num }}</p>
            <p>{{ data.person.names }}, {{ data.person.lastnames }}</p>
        </Column>
        <Column style="width: 4%" field="person.phone" header="Teléfono"/>
        <Column style="width: 3%" field="person.gender" header="Género"/>
        <Column style="width: 10%" field="person.church_description" header="Iglesia" #body="{ data }">
            <p class="font-bold">{{ data?.person?.church_description }}</p>
            <p>{{ data.person.kind_description }}</p>
        </Column>
        <Column style="width: 4%" field="group.vouchergroup" header="# Grupo"/>
        <!--        <Column style="width: 10%" field="person.jobStart" header="Cod. Grupo"/>-->
        <Column style="width: 15%" header="M. Pago" #body="{ data }">
            <div class="flex items-center justify-between gap-2">
                <p class="font-bold">{{ data.group.paymentmethod.description }}</p>
                <Button v-if="data.group.paymentmethod.id !== 1" @click="onShowVoucher(data)" #icon>
                    <i-material-symbols-sticky-note-2-outline-rounded/>
                </Button>
            </div>
        </Column>
        <Column style="width: 4%" header="Monto" #body="{ data }">
            {{ !!data?.amount ? `S/ ${ data?.amount }` : "-" }}
        </Column>
        <Column style="width: 10%" field="observations" header="Observaciones" #body="{ data }">
            <p class="font-semibold">F. Registro: {{ data.created }}</p>
            <p>{{ data.observations }}</p>
        </Column>
        <Column style="width: 4%" header="Estado" field="active" #body="{ data }">
            <Message size="small"
                     :severity="data.status === 'E' || data.status === 'R' ? 'error' : data.status === 'P' ? 'warn' : 'success'">
                {{ data.status_description }}
            </Message>
        </Column>
        <Column style="width: 3%" header="Acciones" #body="{ data }">
            <div class="flex items-center justify-center space-x-1">
                <Button size="small" severity="warn" v-tooltip="'Editar persona'" @click="addParametersUserModal(data)"
                        class="!h-8" #icon>
                    <i-material-symbols-person-edit-outline-rounded/>
                </Button>
                <Button size="small" severity="info" v-tooltip="'Cambiar monto'" @click="onChangeAmount(data)" class="!h-8" #icon>
                    <i-ic-round-attach-money/>
                </Button>
                <Button @click="toggle($event, data.id)" aria-haspopup="true" :aria-controls="`menu_${data.id}`" class="!h-8" #icon>
                    <i-material-symbols-action-key-outline/>
                </Button>
                <Menu :ref="el => menus[data.id] = el" :id="`menu_${data.id}`" :model="optionsActions(data)" :popup="true"
                      #itemicon="{ item }">
                    <component :is="item.class"/>
                </Menu>
            </div>
        </Column>
        <template #paginatorstart>
            <p class="text-lg font-semibold text-primary-500"> Total: {{ totalRecords }} </p>
        </template>
    </DataTable>
</template>
