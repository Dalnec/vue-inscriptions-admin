<script setup lang="ts">
import type { InterfaceMembers } from "@/types/interfaceMembers.ts";
import { useMembersStore } from "@/stores/storeMembers.ts";
import { storeChurches, storeKind } from "../stores/generalInfoStore.ts";

const membersStoreOptions = useMembersStore();

const props = withDefaults(defineProps<{ data: InterfaceMembers }>(), {});

</script>

<template>
    <div class="relative w-full cursor-pointer rounded-lg border bg-white p-4 shadow-md dark:bg-surface-800 dark:border-surface-700">
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
            <div class="flex items-center gap-1">
                <i-material-symbols-id-card-outline-rounded class="text-base"/>
                <span>{{ props.data.doc_num }}</span>
            </div>
            <Button v-tooltip.left="'Eliminar de la lista'" size="small" severity="danger"
                    @click.stop.prevent="membersStoreOptions.removeMembers(props.data)" #icon>
                <i-material-symbols-delete-outline-rounded class="text-lg"/>
            </Button>
        </div>

        <h2 class="mt-1 text-base font-bold text-surface-900 dark:text-white">
            {{ props.data.names }} {{ props.data.lastnames }}
        </h2>

        <div class="mt-1 flex items-center justify-between text-sm">
            <div class="flex items-center gap-1 text-primary-500">
                <i-material-symbols-male-rounded class="text-base" v-if="props.data.gender === 'M'"/>
                <i-material-symbols-female-rounded class="text-base" v-else/>
                <span class="text-surface-700 dark:text-surface-200">{{ props.data.gender === "M" ? "MASCULINO" : "FEMENINO" }}</span>
            </div>
            <div class="flex items-center gap-1 text-gray-500 dark:text-gray-300">
                <i-material-symbols-calendar-month-outline-rounded class="text-base"/>
                <span>Edad: {{ props.data.age }}</span>
            </div>
        </div>

        <!-- Teléfono y Estado -->
        <div class="mt-1 flex items-center justify-between text-sm">
            <div class="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                <i-material-symbols-call class="text-base"/>
                <span>{{ props.data.phone }}</span>
            </div>
            <span class="font-medium text-primary-500">{{ storeKind().kinds.find((ch) => ch.id === props.data.kind)?.description }}</span>
        </div>

        <!-- Iglesia -->
        <div class="mt-1 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
            <i-material-symbols-church-rounded class="text-base"/>
            <span>{{ storeChurches().churches.find((ch) => ch.id === props.data.church)?.description }}</span>
        </div>
    </div>
</template>
