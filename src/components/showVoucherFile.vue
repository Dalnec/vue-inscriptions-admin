<script setup lang="ts">
const props = defineProps({
    imgFile: { default: "", type: String, required: true },
    closeModal: { default: () => ({}), required: false, type: Function }
});


</script>

<template>
    <div>
        <img :src="props.imgFile" alt="" class="rounded-lg mb-4">
        <Button label="Cerrar Visualización" @click="props.closeModal()" fluid/>
    </div>
</template>
