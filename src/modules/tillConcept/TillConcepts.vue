<script setup lang="ts">

import { ref, onMounted } from "vue";
import { h } from "vue";
import { Api } from "@/api/connection.ts";
import { useModal } from "@/composables/useModal.ts";
import ConceptsForm from "@/modules/tillConcept/ConceptsForm.vue";
import type { ConceptsInterface } from "@/types/ConceptsInterface.ts";
import router from "@/router";

const dataConcepts = ref<ConceptsInterface[]>([]);
const loading = ref<boolean>(false);
const { openModal, closeModal } = useModal();

const loadConcepts = async(): Promise<void> => {
    loading.value = true;
    const { response } = await Api.Get({ route: "till/concepts" });
    if (response && response.status === 200) {
        dataConcepts.value = response.data.results || response.data;
        loading.value = false;
    }
};

const onManageConcept = (concept?: ConceptsInterface) => {
    openModal({
        component: h(ConceptsForm, {
            closeModal,
            formData: concept?.id ? { ...concept } : undefined,
            refreshData: loadConcepts
        }),
        header: concept?.id ? "Editar Concepto" : "Agregar Concepto",
        width: "50vw"
    });
};

onMounted(async() => {
    await loadConcepts();
});


</script>

<template>
    <Card #content>
        <div class="align-header mb-4">
            <div class="flex items-center gap-2">
                <Button rounded @click="router.push({name: 'settings', force: true})" #icon>
                    <i-material-symbols-arrow-back-rounded/>
                </Button>
                <p>Configuración de Evento</p>
            </div>
            <Button label="Agregar Concepto" @click="onManageConcept()" class="p-button-primary" #icon>
                <i-material-symbols-list-alt-add/>
            </Button>
        </div>
        <DataTable :value="dataConcepts" :loading="loading" responsiveLayout="scroll" showGridlines>
            <template #empty>
                <EmptyTable/>
            </template>
            <template #loading>
                <LoadingPage/>
            </template>
            <Column field="description" header="Descripción"></Column>
            <Column field="concept_type" header="Tipo" #body="slotProps">
                <Badge :value="slotProps.data.concept_type === 'I' ? 'Ingreso' : 'Egreso'"
                       :severity="slotProps.data.concept_type === 'I' ? 'success' : 'danger'"/>
            </Column>
            <Column field="is_active" header="Activo" #body="slotProps">
                <Tag :value="slotProps.data.is_active ? 'Sí' : 'No'" :severity="slotProps.data.is_active ? 'success' : 'danger'"/>
            </Column>
            <Column field="is_internal" header="Interno" #body="slotProps">
                <Tag :value="slotProps.data.is_internal ? 'Sí' : 'No'" :severity="slotProps.data.is_internal ? 'info' : 'warning'"/>
            </Column>
            <Column header="Acciones" #body="slotProps">
                <Button @click="onManageConcept(slotProps.data)" #icon>
                    <i-material-symbols-edit-document-rounded/>
                </Button>
            </Column>
        </DataTable>
    </Card>
</template>
