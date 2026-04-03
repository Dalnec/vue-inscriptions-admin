<script setup lang="ts">

import { computed, ref } from "vue";
import { useMembersStore } from "@/stores/storeMembers";
import Drawer from "primevue/drawer";
import CardsInfoMember from "@/components/cardsInfoMember.vue";
import routes from "@/router/index";
import { useRoute } from "vue-router";
import { useMembersStorePage } from "@/stores/StoreMembersPage.ts";

const props = defineProps<{ redirectUrl: string, isPage: boolean, urlToAdd: string }>();
const visibleDrawer = ref(false);
const membersStoreOptions = useMembersStore();
const membersStorePage = useMembersStorePage();
const route = useRoute();

const optionsToRender = computed(() => props.isPage ? membersStorePage.membersData : membersStoreOptions.membersData);

const addMoreMembers = async() => {
    visibleDrawer.value = false;
    await routes.push({ name: props.urlToAdd });
};

defineEmits([ "onClickCard" ]);
defineExpose({ visibleDrawer });

</script>

<template>
    <Drawer v-model:visible="visibleDrawer" dismissable position="right" class="!w-full md:!w-[30rem]">
        <template #header>
            <div>
                <p class="p-card-title">
                    Lista de Personas
                </p>
                <p class="p-card-subtitle">
                    {{ optionsToRender.length }} Persona(s) registradas
                </p>
            </div>
        </template>
        <div class="grid space-y-2">
            <cards-info-member v-for="data in optionsToRender" :key="data.id" :data="data" @click="$emit('onClickCard', (data))"
                               :isPage="props.isPage"/>
        </div>
        <template #footer>
            <div class="align-buttons-card-footer">
                <Button label="Agregar más" severity="contrast" @click="addMoreMembers()" fluid #icon>
                    <i-material-symbols-list-alt-add/>
                </Button>
                <Button label="Pagar" @click="routes.push({name: props.redirectUrl, force: true })" fluid
                        v-if="route.name !== props.redirectUrl" #icon>
                    <i-ic-baseline-payments/>
                </Button>
            </div>
        </template>
    </Drawer>
</template>
