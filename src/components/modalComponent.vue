<script setup lang="ts">

/**
 * @type {{ parameters: ModalParameters }}
 */
const { parameters } = defineProps({
    parameters: {
        type: Object,
        required: true,
        default: () => ({
            visible: false,
            header: "",
            width: "50vh",
            footer: "",
            component: {},
            afterClose: () => null
        })
    }
});

defineExpose({ parameters });
</script>

<template>
    <Dialog :breakpoints="{'960px': ' 80vw', '600px': '95vw'}" v-model:visible="parameters.visible" :style="`width: ${parameters.width}`"
            modal closable @after-hide="parameters.afterClose">
        <template #closeicon>
            <i-material-symbols-close-rounded class="text-surface-100"/>
        </template>
        <template #header>
            {{ parameters.header }}
        </template>
        <component :is="parameters.component"/>
        <template #footer v-if="parameters.footer">
            {{ parameters.footer }}
        </template>
    </Dialog>
</template>
