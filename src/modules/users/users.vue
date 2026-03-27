<script setup lang="ts">

import { ref, h } from "vue";
import { useModal } from "@/composables/useModal.ts";
import type { InterfaceUsers } from "@/types/interfaceUsers.ts";
import UserList from "@/modules/users/userList.vue";
import addUsers from "@/modules/users/addUsers.vue";

const refUserList = ref();
const { closeModal, openModal } = useModal();

const addValueParameters = () => {
    openModal({
        component: h(addUsers, {
            closeModal,
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
        <user-list ref="refUserList"/>
    </Card>
</template>
