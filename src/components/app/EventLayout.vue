<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const slug = route.params.slug;

</script>

<template>
    <div class="bg-slate-900 min-h-screen text-white">
        <router-view/>
    </div>
</template>