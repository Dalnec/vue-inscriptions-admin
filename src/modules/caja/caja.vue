<script setup lang="ts">

import "@/stylesTill.css";

import { Api } from "@/api/connection";
import { ref, onMounted, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { h } from "vue";
import type { DataTablePageEvent } from "primevue";
import { storeActivities, storePaymentMethod, storeUsers } from "@/stores/generalInfoStore.ts";
import { useModal } from "@/composables/useModal";
import MovementForm from "@/components/MovementForm.vue";

interface Movement {
    activity: number;
    amount: string;
    concept: number;
    description: string;
    inscription: number;
    movement_at: string;
    payment_method: number;
    reference: string;
    reversal_of: number;
    status: string;
    user: number;
}

interface MovementsMeta {
    cash_total: string;
    movement_count: number;
    total_expenses: string;
    total_incomes: string;
    total_inscriptions: string;
}

const dataMovements = ref<Movement[]>([]);
const loading = ref<boolean>(false);
const rows = ref(25);
const currentPage = ref(1);
const totalRecords = ref(0);
const search = ref("");

const meta = ref<MovementsMeta>({
    cash_total: "0",
    movement_count: 0,
    total_expenses: "0",
    total_incomes: "0",
    total_inscriptions: "0"
});

const filters = ref({
    activity: null as number | null,
    concept: null as number | null,
    concept_type: null as string | null,
    inscription: null as number | null,
    movement_at_from: null as Date | null,
    movement_at_to: null as Date | null,
    payment_method: null as number | null,
    status: null as string | null,
    user: null as number | null
});

const statusOptions = [
    { label: "BORRADOR", value: "DRAFT" },
    { label: "CONTABILIZADO", value: "POSTED" },
    { label: "ANULADO", value: "VOID" }
];

const conceptTypeOptions = [
    { label: "Ingreso", value: "income" },
    { label: "Egreso", value: "expense" }
];

const activitiesOptions = computed(() => storeActivities().activities.map(a => ({ label: a.description, value: a.id })));
const paymentMethodsOptions = computed(() => storePaymentMethod().paymentMethod.map(p => ({ label: p.description, value: p.id })));

const usersOptions = computed(() => {
    return storeUsers().users;
});

const onPageChange = async(event: DataTablePageEvent) => {
    currentPage.value = event.page + 1;
    rows.value = event.rows;
    await loadMovements();
};

const loadMovements = useDebounceFn(async(): Promise<void> => {
    loading.value = true;
    const params = {
        page: currentPage.value,
        page_size: rows.value,
        search: search.value,
        ...Object.fromEntries(Object.entries(filters.value).filter(([ _, v ]) => v !== null && v !== ""))
    };

    const { response } = await Api.Get({
        params,
        route: "till/movements"
    });
    if (response && response.status === 200) {
        dataMovements.value = response.data.results;
        totalRecords.value = response.data.count;
        meta.value = response.data.meta;
        loading.value = false;
    }
}, 250);

onMounted(async() => {
    await storeUsers().getUsers();
    await storeActivities().getActivities();
    await storePaymentMethod().getPaymentMethod();
    await loadMovements();
});

const { openModal, closeModal } = useModal();

const openDialog = (income: boolean) => {
    openModal({
        component: h(MovementForm, {
            closeModal,
            refreshData: loadMovements,
            isIncome: income
        }),
        header: income ? "Registrar Ingreso" : "Registrar Egreso",
        width: "50vw"
    });
};

</script>

<template>
    <Card #content>
        <div class="align-header mb-4">
            <p class="p-card-title"> Movimientos de Caja </p>
            <!-- Action Buttons -->
            <div class="flex gap-4 mb-4">
                <Button label="Registrar Ingreso" icon="pi pi-plus" @click="openDialog(true)" class="p-button-success"/>
                <Button label="Registrar Egreso" icon="pi pi-minus" @click="openDialog(false)" class="p-button-danger"/>
            </div>
        </div>
        <!-- Filters Header -->
        <div class="filters-header">
            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                    <label for="activity">Actividad</label>
                    <Select v-model="filters.activity" inputId="activity" :options="activitiesOptions" optionLabel="label"
                            optionValue="value" placeholder="Seleccionar" fluid @change="loadMovements"/>
                </div>
                <div>
                    <label for="concept">Concepto</label>
                    <InputNumber v-model="filters.concept" inputId="concept" placeholder="ID Concepto" fluid
                                 @input="loadMovements"/>
                </div>
                <div>
                    <label for="concept_type">Tipo de Concepto</label>
                    <Select v-model="filters.concept_type" inputId="concept_type" :options="conceptTypeOptions" optionLabel="label"
                            optionValue="value" placeholder="Seleccionar" fluid @change="loadMovements"/>
                </div>
                <div>
                    <label for="inscription">Inscripción</label>
                    <InputNumber v-model="filters.inscription" inputId="inscription" placeholder="ID Inscripción" fluid
                                 @input="loadMovements"/>
                </div>
                <div>
                    <label for="movement_at_from">Fecha Desde</label>
                    <DatePicker v-model="filters.movement_at_from" inputId="movement_at_from" placeholder="Seleccionar fecha" fluid
                                @date-select="loadMovements"/>
                </div>
                <div>
                    <label for="movement_at_to">Fecha Hasta</label>
                    <DatePicker v-model="filters.movement_at_to" inputId="movement_at_to" placeholder="Seleccionar fecha" fluid
                                @date-select="loadMovements"/>
                </div>
                <div>
                    <label for="payment_method">Método de Pago</label>
                    <Select v-model="filters.payment_method" inputId="payment_method" :options="paymentMethodsOptions"
                            optionLabel="label" optionValue="value" placeholder="Seleccionar" fluid @change="loadMovements"/>
                </div>
                <div>
                    <label for="status">Estado</label>
                    <Select v-model="filters.status" inputId="status" :options="statusOptions" optionLabel="label"
                            optionValue="value" placeholder="Seleccionar" fluid @change="loadMovements"/>
                </div>
                <div>
                    <label for="user">Usuario</label>
                    <Select v-model="filters.user" inputId="user" :options="usersOptions" placeholder="Seleccionar" fluid
                            @change="loadMovements" :optionLabel="(data)=>`${data.names} ${data.lastname}`" optionValue="id"/>
                </div>
                <div>
                    <label for="search">Buscar</label>
                    <InputText v-model="search" inputId="search" placeholder="Buscar movimientos..." fluid @input="loadMovements"/>
                </div>
            </div>
        </div>

        <!-- Meta Totals -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div class="custom-card text-center">
                <div class="custom-card-title">Total Ingresos</div>
                <div class="custom-card-content text-green-600">S/. {{ meta.total_incomes }}</div>
            </div>
            <div class="custom-card text-center">
                <div class="custom-card-title">Total Egresos</div>
                <div class="custom-card-content text-red-600">S/. {{ meta.total_expenses }}</div>
            </div>
            <div class="custom-card text-center">
                <div class="custom-card-title">Total Inscripciones</div>
                <div class="custom-card-content text-blue-600">S/. {{ meta.total_inscriptions }}</div>
            </div>
            <div class="custom-card text-center">
                <div class="custom-card-title">Total en Caja</div>
                <div class="custom-card-content text-purple-600">S/. {{ meta.cash_total }}</div>
            </div>
            <div class="custom-card text-center">
                <div class="custom-card-title">Total Movimientos</div>
                <div class="custom-card-content text-gray-600">{{ meta.movement_count }}</div>
            </div>
        </div>

        <!-- DataTable -->
        <DataTable :value="dataMovements" :loading="loading" :paginator="true" :rows="rows" :totalRecords="totalRecords"
                   tableStyle="min-width: 120rem" size="small" :lazy="true" @page="onPageChange" :rowsPerPageOptions="[10, 25, 50]"
                   responsiveLayout="scroll" showGridlines>
            <template #empty>
                <EmptyTable/>
            </template>
            <template #loading>
                <LoadingPage/>
            </template>

            <Column style="width: 10rem" field="movement_at" header="Fecha"/>
            <Column style="width: 15rem" field="description" header="Descripción"/>
            <Column style="width: 10rem" field="reference" header="Referencia"/>
            <Column style="width: 5rem" field="amount" header="Monto" #body="{ data }">
                <p :class="data.concept_type === 'E' ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'">
                    S/. {{ data.amount }}
                </p>
            </Column>
            <Column style="width: 10rem" field="status" header="Estado" #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'DRAFT' ? 'warn' : 'success'"/>
            </Column>
            <Column style="width: 10rem" field="concept_label" header="Concepto"/>
            <Column style="width: 10rem" field="payment_method_label" header="Método de Pago"/>
            <Column style="width: 10rem" field="inscription" header="Inscripción"/>
            <Column style="width: 10rem" field="user" header="Usuario"/>
            <Column style="width: 10rem" field="activity" header="Actividad"/>
            <Column style="width: 10rem" field="reversal_of" header="Reversión de"/>
        </DataTable>
    </Card>
</template>
