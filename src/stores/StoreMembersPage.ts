import useGlobalToast from "@/composables/toastEvent";
import { ref } from "vue";
import { defineStore } from "pinia";
import type { InterfaceMembers } from "@/types/interfaceMembers.ts";
import routes from "@/router/index";

export const useMembersStorePage = defineStore("useMembersStorePage", () => {
    const membersData = ref<InterfaceMembers[]>([]);
    const selectedMember = ref<InterfaceMembers>();

    const setSelectedMember = (member: InterfaceMembers) => {
        selectedMember.value = member;
    };

    const addNewMembers = (members: InterfaceMembers, resetFilters: () => void, isClickCard: boolean) => {
        const fullName = `${ members.names } ${ members.lastnames }`;
        const index = membersData.value.findIndex(dt => dt.doc_num === members.doc_num);

        if (index !== -1 && !isClickCard) {
            useGlobalToast({ severity: "error", summary: "Error al guardar.", detail: `La persona ${ fullName } ya fue agregada.` });
            return;
        } else if (isClickCard && index !== -1) {
            membersData.value[index] = { ...members };
            useGlobalToast({ summary: "Actualizado", detail: `${ fullName } fue actualizado correctamente.` });
            resetFilters();
        } else {
            useGlobalToast({ severity: "success", summary: "¡Éxito!", detail: `${ fullName } se agregó correctamente.` });

            membersData.value.push(members);
            resetFilters();
        }
    };

    const removeMembers = async(members: InterfaceMembers): Promise<void> => {
        const fullName = `${ members.names } ${ members.lastnames }`;
        membersData.value = membersData.value.filter(dt => dt.doc_num !== members.doc_num);
        useGlobalToast({ severity: "success", summary: "!Eliminado¡", detail: `${ fullName } se eliminó de la lista` });
        if (membersData.value.length === 0) {
            useGlobalToast({ severity: "warn", summary: "!Error¡", detail: `La lista esta vacía, agregue nuevos datos` });
            await routes.push({ name: "newRegister" });
        }
    };

    return { membersData, addNewMembers, removeMembers, setSelectedMember, selectedMember };
});
