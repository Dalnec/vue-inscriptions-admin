<script setup lang="ts">

const props = defineProps<{ dni: string, name: string }>();

</script>

<template>
    <Message severity="error" closable>
        <template #default>
            La persona {{ props.dni }} - {{ props.name }} ya se encuentra inscrita
        </template>
    </Message>
</template>
