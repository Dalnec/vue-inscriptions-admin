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

const conceptSelect = ref("paymentMethod");
const refGeneralTablePaymentMethod = ref();
const refGeneralTableRate = ref();
const refGeneralTableChurch = ref();
const refGeneralTableKind = ref();
const refGeneralTableDocumentType = ref();
const { closeModal, openModal } = useModal();
const activity = ref<null | string>();
const route = useRoute();

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

onMounted(() => {
    activity.value = route.params.slug as string || "";
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
            <Card v-if="conceptSelect === 'paymentMethod' || !conceptSelect" class="max-cols-9">
                <template #title>
                    <div class="align-header">
                        <p> Métodos de pago </p>
                        <Button size="small" label="Agregar nuevo" @click="managePaymentForm( )"/>
                    </div>
                </template>
                <template #content>
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
                </template>
            </Card>
            <Card v-if="conceptSelect === 'rates'" class="max-cols-9">
                <template #title>
                    <div class="align-header">
                        <p> Tarifas </p>
                        <Button size="small" label="Agregar nuevo" @click="manageRates()"/>
                    </div>
                </template>
                <template #content>
                    <general-table-module ref="refGeneralTableRate" route="tarifa" min-width="30rem"
                                          :filters="{ activity_shortname: activity}">
                        <Column header="Precio" field="price" style="width: 5%;"/>
                        <template #actions>
                            <Column style="width: 2%;" #body="{ data }">
                                <Button label="Editar" @click="manageRates(data)"/>
                            </Column>
                        </template>
                    </general-table-module>
                </template>
            </Card>
            <Card v-if="conceptSelect === 'church'" class="max-cols-9">
                <template #title>
                    <div class="align-header">
                        <p>Iglesias</p>
                        <Button size="small" label="Agregar nuevo"
                                @click="addInfoGeneralForm('church',refGeneralTableChurch.getDataTableGeneric)"/>
                    </div>
                </template>
                <template #content>
                    <general-table-module ref="refGeneralTableChurch" route="church" min-width="30rem" #actions>
                        <Column style="width: 2%;" #body="{ data }">
                            <Button label="Editar"
                                    @click="addInfoGeneralForm('church', refGeneralTableChurch.getDataTableGeneric, data)"/>
                        </Column>
                    </general-table-module>
                </template>
            </Card>
            <Card v-if="conceptSelect === 'kindMember'" class="max-cols-9">
                <template #title>
                    <div class="align-header">
                        <p>Tipos de miembros</p>
                        <Button size="small" label="Agregar nuevo"
                                @click="addInfoGeneralForm('kind',refGeneralTableKind.getDataTableGeneric)"/>
                    </div>
                </template>
                <template #content>
                    <general-table-module ref="refGeneralTableKind" route="kind" min-width="30rem" #actions>
                        <Column style="width: 2%;" #body="{ data }">
                            <Button label="Editar"
                                    @click="addInfoGeneralForm('kind', refGeneralTableKind.getDataTableGeneric, data)"/>
                        </Column>
                    </general-table-module>
                </template>
            </Card>
            <Card v-if="conceptSelect === 'documentType'" class="max-cols-9">
                <template #title>
                    <div class="align-header">
                        <p>Tipos de documento</p>
                        <Button size="small" label="Agregar nuevo"
                                @click="addInfoGeneralForm('documentType',refGeneralTableDocumentType.getDataTableGeneric)"/>
                    </div>
                </template>
                <template #content>
                    <general-table-module ref="refGeneralTableDocumentType" route="documentType" min-width="30rem" #actions>
                        <Column style="width: 2%;" #body="{ data }">
                            <Button label="Editar"
                                    @click="addInfoGeneralForm('documentType', refGeneralTableDocumentType.getDataTableGeneric, data)"/>
                        </Column>
                    </general-table-module>
                </template>
            </Card>
        </div>
    </div>
</template>
