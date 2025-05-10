<script setup lang="ts">

interface RateSelectedPayload {
    idRate: number;
    priceRate: string;
    nameRate: string;
}

const emit = defineEmits<{
    (event: "on-rate-selected", payload: RateSelectedPayload): void
}>();

const props = defineProps({
    idRate: { required: false, type: Number, default: 0 },
    idRateSelected: { required: false, type: Number, default: 0 },
    priceRate: { required: true, type: String, default: "" },
    nameRate: { required: true, type: String, default: "" }
});

function rateClicked() {
    emit("on-rate-selected", {
        idRate: props.idRate,
        priceRate: props.priceRate,
        nameRate: props.nameRate
    });
}

</script>

<template>
    <div @click="rateClicked"
         class="col-span-2 flex cursor-pointer items-center justify-center gap-0 rounded-lg p-1 text-center transition text-surface-100 hover:bg-primary-400"
         :class="{ 'bg-green-500 hover:bg-green-600': props.idRate === idRateSelected, 'bg-primary-500': props.idRate !== props.idRateSelected }">
        <div>
            <p class="text-lg font-bold">{{ props.nameRate }}</p>
            <p class="text-xl font-bold">S/ {{ props.priceRate }}</p>
        </div>
    </div>
</template>
