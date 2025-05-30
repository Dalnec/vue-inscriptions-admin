<script setup lang="ts">

import GeneralTableModule from "@/components/generalTableModule.vue";
import router from "@/router";
import ListConcepts from "@/modules/settings/listConcepts.vue";
import { h, ref } from "vue";
import type { ModalParameters } from "@/composables/parametersModalType.ts";
import type { PaymentMethod } from "@/types/interfaceActivities.ts";
import managePaymentMethod from "@/modules/settings/formConcept/managePaymentMethod.vue";
import manageRate from "@/modules/settings/formConcept/manageRate.vue";
import type { InterfaceRates } from "@/types/InterfaceRates.ts";
import basicFormToAddOrEdit from "@/components/app/basicFormToAddOrEdit.vue";

const conceptSelect = ref("paymentMethod");
const refGeneralTablePaymentMethod = ref();
const refGeneralTableTarifa = ref();
const refGeneralTableChurch = ref();
const refGeneralTableKind = ref();
const refGeneralTableDocumentType = ref();

const parameters = ref<ModalParameters>({
    visible: false,
    header: "",
    width: "30vw",
    component: {}
});
const closeModal = (): boolean => parameters.value.visible = false;

const managePaymentForm = (data?: PaymentMethod) => {
    parameters.value = {
        visible: true,
        header: data?.id ? `Editar método de pago: ${ data.description }` : "Agregar Nuevo",
        width: "50vw",
        component: h(managePaymentMethod, {
            closeModal,
            refreshData: () => refGeneralTablePaymentMethod.value.getDataTableGeneric(),
            formData: data || {} as PaymentMethod
        })
    };
};

const manageRates = (data?: InterfaceRates) => {
    parameters.value = {
        visible: true,
        header: data?.id ? `Editar método de pago: ${ data.description }` : "Agregar Nuevo",
        width: "50vw",
        component: h(manageRate, {
            closeModal,
            refreshData: () => refGeneralTablePaymentMethod.value.getDataTableGeneric(),
            formData: data || {} as InterfaceRates
        })
    };
};

const addInfoGeneralForm = (route: string, reloadData: () => Promise<void>, data?: { active: boolean, description: string, id: number }) => {
    parameters.value = {
        component: h(basicFormToAddOrEdit, {
            onCloseForm: closeModal,
            formData: data || {} as { active: boolean, description: string, id: number, },
            reloadData: () => reloadData(),
            route
        }),
        header: data?.id ? `Editar: ${ data.description }` : "Agregar",
        visible: true,
        width: "30vw"
    };
};

</script>

<template>
    <div>
        <div class="mb-2 align-header">
            <div class="flex items-center gap-2">
                <Button severity="secondary" size="small" rounded @click="router.push({name: 'settings', force: true})">
                    <template #icon>
                        <i-material-symbols-arrow-back-rounded/>
                    </template>
                </Button>
                <p class="p-card-title text-surface-700 dark:text-surface-100/90">Configuración de conceptos</p>
            </div>
        </div>
        <div class="align-items-form">
            <list-concepts @onConceptClick="(value)=>conceptSelect = value?.concept || 'paymentMethod'" class="max-cols-3"/>
            <Card v-if="conceptSelect === 'paymentMethod'" class="max-cols-9">
                <template #title>
                    <div class="align-header">
                        <p> Métodos de pago </p>
                        <Button size="small" label="Agregar nuevo" @click="managePaymentForm( )"/>
                    </div>
                </template>
                <template #content>
                    <general-table-module ref="refGeneralTablePaymentMethod" route="paymentMethod" show-status min-width="50rem">
                        <Column style="width: 5%;" field="account" header="Nro de Cuenta"/>
                        <Column style="width: 5%;" field="cci" header="CCI"/>
                        <template #actions>
                            <Column style="width: 2%;">
                                <template #body="{data}">
                                    <Button label="Editar" @click="managePaymentForm(data)"/>
                                </template>
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
                    <general-table-module ref="refGeneralTableTarifa" route="tarifa" show-status min-width="30rem">
                        <Column header="Precio" field="price" style="width: 5%;"/>
                        <template #actions>
                            <Column style="width: 2%;">
                                <template #body="{data}">
                                    <Button label="Editar" @click="manageRates(data)"/>
                                </template>
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
                    <general-table-module ref="refGeneralTableChurch" route="church" show-status min-width="30rem">
                        <template #actions>
                            <Column style="width: 2%;">
                                <template #body="{data}">
                                    <Button label="Editar"
                                            @click="addInfoGeneralForm('church', refGeneralTableChurch.getDataTableGeneric, data)"/>
                                </template>
                            </Column>
                        </template>
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
                    <general-table-module ref="refGeneralTableKind" route="kind" show-status min-width="30rem">
                        <template #actions>
                            <Column style="width: 2%;">
                                <template #body="{data}">
                                    <Button label="Editar"
                                            @click="addInfoGeneralForm('kind', refGeneralTableKind.getDataTableGeneric, data)"/>
                                </template>
                            </Column>
                        </template>
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
                    <general-table-module ref="refGeneralTableDocumentType" route="documentType" show-status min-width="30rem">
                        <template #actions>
                            <Column style="width: 2%;">
                                <template #body="{data}">
                                    <Button label="Editar"
                                            @click="addInfoGeneralForm('documentType', refGeneralTableDocumentType.getDataTableGeneric, data)"/>
                                </template>
                            </Column>
                        </template>
                    </general-table-module>
                </template>
            </Card>
        </div>
        <modal-component :parameters/>
    </div>
</template>
