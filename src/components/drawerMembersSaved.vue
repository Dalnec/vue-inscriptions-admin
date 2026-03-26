<script setup lang="ts">

import { ref } from "vue";
import { useMembersStore } from "@/stores/storeMembers";
import Drawer from "primevue/drawer";
import CardsInfoMember from "@/components/cardsInfoMember.vue";
import routes from "@/router/index";
import { useRoute } from "vue-router";

const visibleDrawer = ref(false);
const membersStoreOptions = useMembersStore();
const route = useRoute();

const addMoreMembers = async() => {
    visibleDrawer.value = false;
    await routes.push({ name: "inscription-members" });
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
                    {{ membersStoreOptions.membersData.length }} Persona(s) registradas
                </p>
            </div>
        </template>
        <div class="grid space-y-2">
            <cards-info-member v-for="data in  membersStoreOptions.membersData" :key="data.doc_num" :doc_num="data.doc_num"
                               :church="data.church" :doc-type="data.documenttype" :gender="data.gender" :kind="data.kind"
                               :names="data.names" :lastnames="data.lastnames" :phone="data.phone" :age="data.age"
                               @click="$emit('onClickCard', (data))" :status="data.status"/>
        </div>
        <template #footer>
            <div class="align-buttons-card-footer">
                <Button label="Agregar más" severity="contrast" @click="addMoreMembers()" fluid #icon>
                    <i-material-symbols-list-alt-add/>
                </Button>
                <Button label="Pagar" @click="routes.push({name:'pay-inscription-members'})" fluid
                        v-if="route.name !== 'pay-inscription-members'" #icon>
                    <i-ic-baseline-payments/>
                </Button>
            </div>
        </template>
    </Drawer>
</template>
