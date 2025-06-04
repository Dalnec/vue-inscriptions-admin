<script setup lang="ts">
import type { InscriptionsMembers, InterfaceActionsInscriptions } from "@/modules/inscriptions/inscriptionsMembers.ts";
import { Api } from "@/api/connection.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { onMounted, ref } from "vue";

const props = defineProps<{ closeModal: () => void; refreshData: () => Promise<void>; formData: InscriptionsMembers }>();
const observationText = ref("");

const onAddObsMember = async(): Promise<void> => {
    const { response }: InterfaceActionsInscriptions = await Api.Put({
        route: `inscription/${ props.formData.id }`, data: { ...props.formData, observations: observationText.value }
    });
    if (response && response.status === 200) {
        await props.refreshData();
        props.closeModal();
        toastEvent({ message: "Detalle añadido...", severity: "success" });
    }
};

onMounted(() => {
    observationText.value = props.formData.observations ?? "";
});

</script>

<template>
    <div class="align-items-form">
        <FormItem label="Añadir detalles" cols="12">
            <Textarea v-model="observationText" fluid auto-resize/>
        </FormItem>
        <FormItem hide-error hide-label cols="12">
            <Button label="Agregar observación" @click="onAddObsMember()" fluid/>
        </FormItem>
    </div>
</template>
