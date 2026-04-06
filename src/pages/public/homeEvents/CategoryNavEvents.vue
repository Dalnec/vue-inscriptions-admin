<script setup lang="ts">
import { computed } from "vue";
import type { TagInterface } from "@/types/TagInterface.ts";

const props = defineProps<{
    categories: TagInterface[];
    modelValue?: string;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

const selected = computed({
    get: () => props.modelValue || "",
    set: (value: string) => emit("update:modelValue", value)
});

const selectCategory = (slug: string) => {
    selected.value = selected.value === slug ? "" : slug;
};

const isActive = (slug: string) => selected.value === slug;

const getTextColor = (bgColor: string) => {
    const c = bgColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    return luminance > 186 ? "#000000" : "#ffffff";
};

const getStyles = (cat: TagInterface, active: boolean) => {
    const text = getTextColor(cat.color);

    if (active) {
        return {
            backgroundColor: cat.color,
            border: `1px solid ${ cat.color }`,
            color: text
        };
    }

    return {
        backgroundColor: `${ cat.color }20`,
        border: `1px solid ${ cat.color }40`,
        color: cat.color
    };
};

</script>

<template>
    <section class="px-6 py-12 max-w-screen-2xl mx-auto">
        <div class="flex flex-wrap justify-center gap-3">
            <Button v-for="cat in categories" :key="cat.id" :label="cat.name" rounded size="large"
                    class="!px-5 !py-2.5 transition-all duration-200 backdrop-blur-sm"
                    :style="getStyles(cat, isActive(cat.slug))"
                    @click="selectCategory(cat.slug)"/>

        </div>
    </section>
</template>
