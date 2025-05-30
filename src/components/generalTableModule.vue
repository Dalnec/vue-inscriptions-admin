<script setup lang="ts">

/**
 *
 * @module generalTableModule
 *
 */

/**
 * @fileoverview
 * This component displays a generic data table that fetches its data from an API.
 * It supports filtering, status toggling, and customizable minimum width.
 *
 * The component uses debounce functions to limit the frequency of API calls.
 * It also exposes functions to refresh the data and update an item's status.
 */

import { useDebounceFn } from "@vueuse/core";
import { Api } from "@/api/connection";
import { onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import LoadingPage from "./loadingPage.vue";
import EmptyTable from "./emptyTable.vue";
import { type DataTablePageEvent } from "primevue";

/**
 * Interface for the component's props.
 */
export interface PropsTable {
    /**
     * API route used to fetch data for the table.
     */
    route: string;
    /**
     * Name of the module to which the table belongs.
     */
    name?: string;
    /**
     * Object containing filters to apply when querying data.
     */
    filters?: object;
    /**
     * Determines whether the status column should be displayed.
     * Default is false.
     */
    showStatus?: boolean;
    /**
     * Determines whether the id column should be displayed.
     * Default is false.
     */
    showID?: boolean;
    /**
     * Minimum width of the table.
     * The default value is "55rem".
     */
    minWidth?: string;
}

/**
 * Define component props with default values.
 */
const props = withDefaults(defineProps<PropsTable>(), {
    minWidth: "55rem"
});

/**
 * Interface for the general data items displayed in the table.
 */
export interface GeneralData {
    /**
     * Description of the data item.
     */
    description?: string;
    /**
     * Indicates whether the item is active.
     */
    active: boolean;
    /**
     * Symbol associated with the data item.
     */
    symbol?: string;
    /**
     * Indicates if the item is free.
     */
    free?: boolean;
    /**
     * Indicates if the item is available for exportation.
     */
    exportation?: boolean;
    /**
     * Percentage value related to the item.
     */
    percentage?: number;
    /**
     * Operation type identifier or name.
     */
    operationType?: number | string;
    /**
     * Unique identifier of the data item.
     */
    id?: number;
}

/**
 * Reactive reference to hold the table data.
 */
const dataGenericTable = ref<GeneralData[]>([]);

/**
 * Toast notification service instance.
 */
const toast = useToast();

/**
 * Loading state indicator for API calls.
 */
const loading = ref<boolean>(false);

/**
 * paginator state indicator for show pagination in the primevue table.
 */
const showPaginator = ref(false);

/**
 * total of content in the endpoint.
 */
const totalRecords = ref(0);

/**
 * initial page in the table
 */
const currentPage = ref(1);

/**
 * total of content by page.
 */
const rows = ref(20);

/**
 * Debounced function to fetch table data from the API.
 *
 * Calls the API using the provided route and filters.
 * If the API returns a valid response, it updates the dataGenericTable.
 */
const getDataTableGeneric = useDebounceFn(async() => {
    try {
        loading.value = true;
        const { response } = await Api.Get({
            route: props.route, params: { ...props.filters, page: currentPage.value, page_size: rows.value }
        });
        if (response && response?.status === 200) {
            // Check if data is nested under 'results'
            if (response?.data?.results) {
                dataGenericTable.value = response.data.results;
                totalRecords.value = response.data?.count;
                showPaginator.value = true;
                loading.value = false;
            } else {
                dataGenericTable.value = response.data;
                loading.value = false;
            }
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        loading.value = false;
    }
}, 500);

/**
 * Function to change into page in table
 *
 * @param {DataTablePageEvent} event - The event to change into pages
 */
const onPageChange = async(event: DataTablePageEvent) => {
    currentPage.value = event.page + 1;
    rows.value = event.rows;
    await getDataTableGeneric();
};

/**
 * Debounced function to update the status of a data item.
 *
 * Sends an API request to update the item's status.
 * If successful, it displays a toast notification and refreshes the data table.
 *
 * @param {GeneralData} data - The data item whose status is to be updated.
 */
const onchangeStatus = useDebounceFn(async(data: GeneralData) => {
    try {
        loading.value = true;
        const { response } = await Api.Patch({ route: `${ props.route }/${ data.id }`, data: { active: data.active } });
        if (response?.status === 200) {
            toast.add({ summary: "Estado cambiado", detail: `Estado cambiado para: ${ data.description }`, life: 5000 });
            await getDataTableGeneric();
        }
    } catch (error) {
        toast.add({ summary: "Server Error", detail: error || "", life: 5000 });
        console.error(error);
    } finally {
        loading.value = false;
    }
}, 500);

/**
 * Lifecycle hook that fetches table data when the component is mounted.
 */
onMounted(async() => await getDataTableGeneric());

/**
 * Expose functions for external access (e.g., parent components).
 */
defineExpose({ getDataTableGeneric, onchangeStatus });

</script>

<template>
    <DataTable :value="dataGenericTable" size="small" :tableStyle="`min-width: ${props.minWidth}`" lazy :loading :paginator="showPaginator"
               :rows :totalRecords :first="currentPage * rows - rows" @page="onPageChange">
        <!-- Template to show when there is no data -->
        <template #empty>
            <empty-table/>
        </template>
        <!-- Template to show a loading indicator while data is being fetched -->
        <template #loading>
            <loading-page/>
        </template>
        <!-- Data columns -->
        <Column style="width: 10%" field="id" header="ID" v-if="props.showID"/>
        <Column style="width: 15%" field="description" header="Description"/>
        <!-- Slot for additional custom columns -->
        <slot/>
        <!-- Column for status, displayed only if showStatus prop is true -->
        <Column style="width: 5%" field="active" header="Estado" v-if="props.showStatus">
            <template #body="{ data }">
                <div class="flex items-center">
                    <ToggleSwitch v-model="data.active" @update:modelValue="onchangeStatus(data)"/>
                </div>
            </template>
        </Column>
        <slot name="actions"/>
    </DataTable>
</template>
