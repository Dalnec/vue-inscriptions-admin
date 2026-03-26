<script setup lang="ts">

import { Api } from "@/api/connection";
import { ref, onMounted, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import type { DataTablePageEvent } from "primevue";
import { storeActivities, storePaymentMethod, storeUsers } from "@/stores/generalInfoStore.ts";

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

interface MovementsResponse {
    count: number;
    meta: MovementsMeta;
    next: string | null;
    previous: string | null;
    results: Movement[];
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
    console.log(storeUsers().users);
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

</script>

<template>
    <div>
        <Card>
            <template #title>
                Movimientos de Caja
            </template>
            <template #content>
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
                           size="small" :lazy="true" @page="onPageChange" :rowsPerPageOptions="[10, 25, 50]" responsiveLayout="scroll"
                           showGridlines>
                    <template #empty>
                        <EmptyTable/>
                    </template>
                    <template #loading>
                        <LoadingPage/>
                    </template>
                    
                    <Column field="movement_at" header="Fecha" :sortable="true" #body="slotProps">
                        {{ new Date(slotProps.data.movement_at).toLocaleString() }}
                    </Column>
                    <Column field="description" header="Descripción" :sortable="true"></Column>
                    <Column field="reference" header="Referencia" :sortable="true"></Column>
                    <Column field="amount" header="Monto" :sortable="true" #body="slotProps"> 
                        <span :class="slotProps.data.amount.startsWith('-') ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'">
                            S/. {{ slotProps.data.amount }}
                        </span>
                    </Column>
                    <Column field="status" header="Estado" :sortable="true" #body="slotProps">
                        <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'DRAFT' ? 'warn' : 'success'"/>
                    </Column>
                    <Column field="concept" header="Concepto" :sortable="true"></Column>
                    <Column field="payment_method" header="Método de Pago" :sortable="true"></Column>
                    <Column field="inscription" header="Inscripción" :sortable="true"></Column>
                    <Column field="user" header="Usuario" :sortable="true"></Column>
                    <Column field="activity" header="Actividad" :sortable="true"></Column>
                    <Column field="reversal_of" header="Reversión de" :sortable="true"></Column>
                </DataTable>
            </template>
        </Card>
    </div>
</template>
