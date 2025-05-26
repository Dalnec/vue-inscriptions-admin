<script setup lang="ts">

import GeneralTableModule from "@/components/generalTableModule.vue";
import router from "@/router";
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
        <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
                <template #title>
                    Métodos de pago
                </template>
                <template #content>
                    <general-table-module route="paymentMethod" show-status min-width="30rem"/>
                </template>
            </Card>
            <Card>
                <template #title>
                    Tarifas
                </template>
                <template #content>
                    <general-table-module route="tarifa" show-status min-width="30rem"/>
                </template>
            </Card>
            <Card>
                <template #title>
                    Iglesias
                </template>
                <template #content>
                    <general-table-module route="church" show-status min-width="30rem"/>
                </template>
            </Card>
            <Card>
                <template #title>
                    Tipos de miembros
                </template>
                <template #content>
                    <general-table-module route="kind" show-status min-width="30rem"/>
                </template>
            </Card>
            <Card>
                <template #title>
                    Tipos de documento
                </template>
                <template #content>
                    <general-table-module route="documentType" show-status min-width="30rem"/>
                </template>
            </Card>
        </div>
    </div>
</template>
