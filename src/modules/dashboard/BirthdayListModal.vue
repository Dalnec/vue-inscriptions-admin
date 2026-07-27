<script setup lang="ts">
defineProps<{
    people: {
        person_id: number;
        fullname: string;
        birthdate: string;
        age_at_event: number;
        gender: string;
        church_name: string | null;
        kind: string | null;
        inscription_status: string | null;
    }[];
}>();
</script>

<template>
    <div class="space-y-2">
        <div v-for="person in people" :key="person.person_id"
             class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                 :class="person.gender === 'FEMENINO'
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'">
                <i class="i-ic-round-celebration text-base"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ person.fullname }}</span>
                    <span class="text-xs font-semibold text-rose-500 dark:text-rose-400 shrink-0">{{ person.age_at_event }} años</span>
                </div>
                <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ person.birthdate }}</span>
                    <span v-if="person.church_name" class="truncate">• {{ person.church_name }}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span v-if="person.kind" class="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                        {{ person.kind }}
                    </span>
                    <span v-if="person.inscription_status" class="text-xs px-1.5 py-0.5 rounded"
                          :class="{
                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400': person.inscription_status === 'CONFIRMADO',
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': person.inscription_status === 'PENDIENTE',
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400': person.inscription_status === 'RECHAZADO',
                            'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300': !['CONFIRMADO','PENDIENTE','RECHAZADO'].includes(person.inscription_status)
                          }">
                        {{ person.inscription_status }}
                    </span>
                </div>
            </div>
        </div>
        <div v-if="!people.length" class="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            No hay cumpleañeros registrados
        </div>
    </div>
</template>
