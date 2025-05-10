<script setup lang="ts">

import InscriptionList from "@/modules/inscriptions/inscriptionList.vue";
</script>

<template>
    <Card>
        <template #title>
            Lista de personas inscritas
        </template>
        <template #content>
            <inscription-list/>
        </template>
    </Card>
</template>
