<script setup lang="ts">


import { ref } from "vue";

const selectedConcept = ref("paymentMethod");
const listConcepts = ref([
    { label: "Métodos de pago", value: "paymentMethod" },
    { label: "Tarifas", value: "rates" },
    { label: "Iglesias", value: "church" },
    { label: "Tipos de miembros", value: "kindMember" },
    { label: "Tipos de documento", value: "documentType" }
]);

const emit = defineEmits([ "onConceptClick" ]);

</script>

<template>
    <Listbox :options="listConcepts" option-value="value" option-label="label" v-model="selectedConcept" checkmark
             @update:modelValue="(value)=>emit('onConceptClick', {concept: value})"/>
</template>
