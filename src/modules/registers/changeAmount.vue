<script setup lang="ts">
import { ref } from "vue";
import type { InterfaceMembers } from "@/composables/interfaceMembers.ts";
import { Api } from "@/api/connection.ts";
import type { InterfaceActionsInscriptions } from "@/modules/inscriptions/inscriptionsMembers.ts";
import toastEvent from "@/composables/toastEvent.ts";

const newAmount = ref(0);
const props = defineProps({
    closeModal: { default: () => ({}), required: false, type: Function },
    formData: { default: {} as InterfaceMembers, required: false, type: Object },
    refreshData: { default: () => ({}), required: false, type: Function }
});

const onChangeAmount = async() => {
    const { response }: InterfaceActionsInscriptions = await Api.Put({
        route: `inscription/${ props.formData.id }`, data: { ...props.formData, amount: newAmount.value }
    });
    if (response && response.status === 200) {
        toastEvent({ severity: "success", summary: "Nuevo monto agregado" });
        props.refreshData();
        props.closeModal();
    }
};

</script>

<template>
    <div>
        <FormItem label="Nuevo Monto">
            <InputNumber v-model="newAmount" fluid/>
        </FormItem>
        <Button label="Guardar" fluid @click="onChangeAmount"/>
    </div>
</template>
