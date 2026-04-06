<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { InscriptionsMembers, InterfaceActionsInscriptions } from "@/modules/inscriptions/inscriptionsMembers.ts";

const props = defineProps<{ closeModal: () => void; refreshData: () => Promise<void>; formData: InscriptionsMembers }>();
const observationText = ref("");

const onAddObsMember = async(): Promise<void> => {
    const { response }: InterfaceActionsInscriptions = await Api.Put({
        route: `inscription/${ props.formData.id }`, data: { ...props.formData, observations: observationText.value }
    });
    if (response && response.status === 200) {
        await props.refreshData();
        props.closeModal();
        useGlobalToast({ detail: "Detalle añadido...", severity: "success" });
    }
};

onMounted(() => {
    observationText.value = props.formData.observations ?? "";
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem label="Añadir detalles" span="12">
            <Textarea v-model="observationText" fluid auto-resize/>
        </ValidateFormItem>
        <ValidateFormItem hide-error hide-label span="12">
            <Button label="Agregar observación" @click="onAddObsMember()" fluid/>
        </ValidateFormItem>
    </div>
</template>
