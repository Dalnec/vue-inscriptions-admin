<script setup lang="ts">

import router from "@/router";
import { h, onMounted, ref } from "vue";
import { useModal } from "@/composables/useModal.ts";
import type { PaymentMethod } from "@/types/interfaceActivities.ts";
import type { InterfaceRates } from "@/types/InterfaceRates.ts";
import GeneralTableModule from "@/components/generalTableModule.vue";
import ListConcepts from "@/modules/settings/listConcepts.vue";
import managePaymentMethod from "@/modules/settings/formConcept/managePaymentMethod.vue";
import manageRate from "@/modules/settings/formConcept/manageRate.vue";
import basicFormToAddOrEdit from "@/components/app/basicFormToAddOrEdit.vue";
import { useRoute } from "vue-router";
import { Api } from "@/api/connection";
import TagForm from "@/modules/settings/TagForm.vue";

const conceptSelect = ref("paymentMethod");
const refGeneralTablePaymentMethod = ref();
const refGeneralTableRate = ref();
const refGeneralTableChurch = ref();
const refGeneralTableKind = ref();
const refGeneralTableDocumentType = ref();
const { closeModal, openModal } = useModal();
const activity = ref<null | string>();
const route = useRoute();
const tags = ref([]);

const managePaymentForm = (data?: PaymentMethod) => {
    openModal({
        component: h(managePaymentMethod, {
            closeModal,
            refreshData: () => refGeneralTablePaymentMethod.value.getDataTableGeneric(),
            formData: data || {} as PaymentMethod
        }),
        header: data?.id ? `Editar método de pago: ${ data.description }` : "Agregar Nuevo",
        width: "50vw"
    });
};

const manageRates = (data?: InterfaceRates) => {
    openModal({
        component: h(manageRate, {
            closeModal,
            formData: data || {} as InterfaceRates,
            refreshData: () => refGeneralTableRate.value.getDataTableGeneric()
        }),
        header: data?.id ? `Editar Tarifa: ${ data.description }` : "Agregar Nuevo",
        width: "50vw"
    });
};

const addInfoGeneralForm = (route: string, reloadData: () => Promise<void>, data?: { active: boolean, description: string, id: number }) => {
    openModal({
        component: h(basicFormToAddOrEdit, {
            formData: data || {} as { active: boolean, description: string, id: number, },
            onCloseForm: closeModal,
            reloadData: () => reloadData(),
            route,
            showActive: true
        }),
        header: data?.id ? `Editar: ${ data.description }` : "Agregar",
        width: "30vw"
    });
};

const onManageTagForm = (tag?: { id: number, name: string, color: string }) => {
    openModal({
        component: h(TagForm, {
            closeModal,
            form: tag || { name: "", color: "" },
            refreshData: () => fetchTags()
        }),
        header: tag ? `Editar etiqueta: ${ tag.name }` : "Agregar nueva etiqueta",
        width: "30vw"
    });
};

const fetchTags = async() => {
    try {
        const { response } = await Api.Get({ route: "tag" });
        if (response && response.status === 200) {
            tags.value = response.data;
        }
    } catch (error) {
        console.error("Error fetching tags:", error);
    }
};

onMounted(() => {
    activity.value = route.params.slug as string || "";
    fetchTags();
});

</script>

<template>
    <div>
        <div class="mb-2 align-header">
            <div class="flex items-center gap-2">
                <Button severity="secondary" size="small" rounded @click="router.push({name: 'settings', force: true})" #icon>
                    <i-material-symbols-arrow-back-rounded/>
                </Button>
                <p class="p-card-title text-surface-700 dark:text-surface-100/90">Configuración de conceptos</p>
            </div>
        </div>
        <div class="align-items-form">
            <list-concepts @onConceptClick="(value)=>conceptSelect = value?.concept || 'paymentMethod'" class="max-cols-3"/>
            <Card v-if="conceptSelect === 'paymentMethod' || !conceptSelect" class="max-cols-9" #content>
                <div class="align-header mb-4">
                    <p> Métodos de pago </p>
                    <Button size="small" label="Agregar nuevo" @click="managePaymentForm( )"/>
                </div>
                <general-table-module ref="refGeneralTablePaymentMethod" route="paymentMethod" min-width="50rem"
                                      :filters="{ activity_shortname: activity}">
                    <Column style="width: 5%;" field="account" header="Nro de Cuenta"/>
                    <Column style="width: 5%;" field="cci" header="CCI"/>
                    <template #actions>
                        <Column style="width: 2%;" #body="{ data }">
                            <Button label="Editar" @click="managePaymentForm(data)"/>
                        </Column>
                    </template>
                </general-table-module>
            </Card>
            <Card v-if="conceptSelect === 'rates'" class="max-cols-9" #content>
                <div class="align-header mb-4">
                    <p> Tarifas </p>
                    <Button size="small" label="Agregar nuevo" @click="manageRates()"/>
                </div>
                <general-table-module ref="refGeneralTableRate" route="tarifa" min-width="30rem" :filters="{ activity_shortname: activity}">
                    <Column header="Precio" field="price" style="width: 5%;"/>
                    <template #actions>
                        <Column style="width: 2%;" #body="{ data }">
                            <Button label="Editar" @click="manageRates(data)"/>
                        </Column>
                    </template>
                </general-table-module>
            </Card>
            <Card v-if="conceptSelect === 'church'" class="max-cols-9" #content>
                <div class="align-header mb-4">
                    <p>Iglesias</p>
                    <Button size="small" label="Agregar nuevo"
                            @click="addInfoGeneralForm('church',refGeneralTableChurch.getDataTableGeneric)"/>
                </div>
                <general-table-module ref="refGeneralTableChurch" route="church" min-width="30rem" #actions>
                    <Column style="width: 2%;" #body="{ data }">
                        <Button label="Editar" @click="addInfoGeneralForm('church', refGeneralTableChurch.getDataTableGeneric, data)"/>
                    </Column>
                </general-table-module>
            </Card>
            <Card v-if="conceptSelect === 'kindMember'" class="max-cols-9" #content>
                <div class="align-header mb-4">
                    <p>Tipos de miembros</p>
                    <Button size="small" label="Agregar nuevo" @click="addInfoGeneralForm('kind',refGeneralTableKind.getDataTableGeneric)"/>
                </div>
                <general-table-module ref="refGeneralTableKind" route="kind" min-width="30rem" #actions>
                    <Column style="width: 2%;" #body="{ data }">
                        <Button label="Editar" @click="addInfoGeneralForm('kind', refGeneralTableKind.getDataTableGeneric, data)"/>
                    </Column>
                </general-table-module>
            </Card>
            <Card v-if="conceptSelect === 'documentType'" class="max-cols-9" #content>
                <div class="align-header mb-4">
                    <p>Tipos de documento</p>
                    <Button size="small" label="Agregar nuevo"
                            @click="addInfoGeneralForm('documentType',refGeneralTableDocumentType.getDataTableGeneric)"/>
                </div>
                <general-table-module ref="refGeneralTableDocumentType" route="documentType" min-width="30rem" #actions>
                    <Column style="width: 2%;" #body="{ data }">
                        <Button label="Editar"
                                @click="addInfoGeneralForm('documentType', refGeneralTableDocumentType.getDataTableGeneric, data)"/>
                    </Column>
                </general-table-module>
            </Card>
            <Card v-if="conceptSelect === 'tag'" class="max-cols-9" #content>
                <div class="align-header mb-4">
                    <p>Etiquetas</p>
                    <Button @click="onManageTagForm()" label="Crear etiquetas"/>
                </div>
                <DataTable :value="tags" responsiveLayout="scroll" size="small">
                    <Column field="name" header="Nombre"></Column>
                    <Column header="Color" #body="{ data }">
                        <div class="flex gap-3">
                            <span :style="{ backgroundColor: data.color }" class="w-5 h-5 inline-block rounded-md"></span>
                            {{ data.color }}
                        </div>
                    </Column>
                    <Column header="Acciones" #body="{ data }">
                        <Button label="Editar" @click="onManageTagForm(data)" #icon>
                            <i-material-symbols-edit-document-rounded/>
                        </Button>
                    </Column>
                </DataTable>
            </Card>
        </div>
    </div>
</template>
