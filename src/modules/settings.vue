<script setup lang="ts">

import GeneralTableModule from "@/components/generalTableModule.vue";
</script>

<template>
    <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
            <template #title>
                Métodos de pago
            </template>
            <template #content>
                <general-table-module route="paymentMethod" show-status min-width="40rem"/>
            </template>
        </Card>
        <Card>
            <template #title>
                Tarifas
            </template>
            <template #content>
                <general-table-module route="tarifa" show-status min-width="40rem"/>
            </template>
        </Card>
        <Card>
            <template #title>
                Iglesias
            </template>
            <template #content>
                <general-table-module route="church" show-status min-width="40rem"/>
            </template>
        </Card>
        <Card>
            <template #title>
                Tipos de miembros
            </template>
            <template #content>
                <general-table-module route="kind" show-status min-width="40rem"/>
            </template>
        </Card>
        <Card>
            <template #title>
                Tipos de documento
            </template>
            <template #content>
                <general-table-module route="documentType" show-status min-width="40rem"/>
            </template>
        </Card>
    </div>
</template>
