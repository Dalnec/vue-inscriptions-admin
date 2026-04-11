<script setup lang="ts">

import { ref, h, computed } from "vue";
import { useModal } from "@/composables/useModal.ts";
import type { InterfaceUsers } from "@/types/interfaceUsers.ts";
import UserList from "@/modules/users/userList.vue";
import addUsers from "@/modules/users/addUsers.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const refUserList = ref();
const { closeModal, openModal } = useModal();
const isConsole = computed(() => route.path.startsWith("/console"));

const addValueParameters = () => {
    openModal({
        breakpoints: { "1400px": "94vw", "1100px": "96vw", "640px": "99vw" },
        component: h(addUsers, {
            closeModal,
            showStaff: isConsole.value,
            refreshData: () => refUserList.value.loadUserList(),
            formData: <InterfaceUsers> {}
        }),
        header: "Nuevo Usuario",
        width: "50vw"
    });
};

</script>

<template>
    <Card #content>
        <div class="align-header mb-4">
            <p>
                Lista de usuarios
            </p>
            <Button label="Nuevo Usuario" size="small" @click="addValueParameters" #icon>
                <i-material-symbols-person-add-outline-rounded/>
            </Button>
        </div>
        <user-list ref="refUserList" :onlyStaff="isConsole"/>
    </Card>
</template>
