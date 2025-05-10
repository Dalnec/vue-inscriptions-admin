<script setup lang="ts">

import UserList from "@/modules/users/userList.vue";
import type { ModalParameters } from "@/composables/parametersModalType.ts";
import addUsers from "@/modules/users/addUsers.vue";
import type { InterfaceUsers } from "@/modules/users/interfaceUsers.ts";
import { ref, h } from "vue";

const refUserList = ref();
const parameters = ref<ModalParameters>({
    visible: false,
    header: "",
    width: "30vw",
    component: {}
});

const closeModal = () => parameters.value.visible = false;

const componentAddBranchModal = h(addUsers, {
    closeModal,
    refreshData: () => refUserList.value.loadUserList(),
    formData: <InterfaceUsers> {}
});

const addValueParameters = () => {
    parameters.value = {
        visible: true,
        header: "Nuevo Usuario",
        width: "50vw",
        component: componentAddBranchModal
    };
};

</script>

<template>
    <Card>
        <template #title>
            <div class="align-header">
                <div>
                    Lista de usuarios
                </div>
                <div>
                    <Button label="Nuevo Usuario" size="small" @click="addValueParameters">
                        <template #icon>
                            <i-fluent-people-add-16-filled/>
                        </template>
                    </Button>
                </div>
            </div>
        </template>
        <template #content>
            <user-list ref="refUserList"/>
            <modal-component :parameters/>
        </template>
    </Card>
</template>
