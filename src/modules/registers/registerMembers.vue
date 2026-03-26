<script setup lang="ts">

import { computed, onMounted, ref, watch } from "vue";
import { useMembersStore } from "@/stores/storeMembers.ts";
import type { InterfaceMembers, UsersActiosMembers } from "@/types/interfaceMembers.ts";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import useGlobalToast from "@/composables/toastEvent";
import ValidateFormItem from "@/components/ValidateFormItem.vue";
import DrawerMembersSaved from "@/components/drawerMembersSaved.vue";
import { storeChurches, storeDocumentType, storeKind } from "@/stores/generalInfoStore.ts";
import { type DataDNI, getDataReniec, type MemberExist } from "@/composables/getDataReniec.ts";
import { Api } from "@/api/connection.ts";

const refDrawerMembersSaved = ref();
const loadingSearch = ref(false);
const membersStoreOptions = useMembersStore();
const isClickCard = ref(false);
const wasDniChecked = ref(false);
// const showMessage = ref(false);
// const infoMessage = ref({ dni: "", names: "" });

const props = defineProps({
    closeModal: { default: () => ({}), required: false, type: Function },
    formData: { default: {} as InterfaceMembers, required: false, type: Object },
    refreshData: { default: () => ({}), required: false, type: Function }
});

const formMembers = ref<InterfaceMembers>({
    church: null, doc_num: "", documenttype: 1, gender: "", kind: null, lastnames: "", names: "", phone: "", status: true, age: null
});

const validationSchema = ref(yup.object({
    // birthdate: yup.string().required("Agrega una fecha valida"),
    church: yup.string().required("Seleccione una iglesia"),
    documenttype: yup.string().required("Seleccione un tipo de identificación"),
    doc_num: yup.string().required("Agregue un DNI"),
    gender: yup.string().required("Seleccione un género"),
    kind: yup.string().required("Seleccione a donde pertenece"),
    lastnames: yup.string().required("Agregue sus apellidos"),
    names: yup.string().required("Agregue sus nombres"),
    phone: yup.string().required("Añada un teléfono valido")
}));

const { handleReset, handleSubmit, setValues } = useForm<InterfaceMembers>({ validationSchema, initialValues: formMembers.value });

// const { value: birthdate, handleBlur: birthdateHandle } = useField<Date | null>("birthdate");
const { value: church } = useField<string>("church");
const { value: doc_num } = useField<string>("doc_num");
const { value: documenttype } = useField<number>("documenttype");
const { value: gender } = useField<string>("gender");
const { value: kind } = useField<number>("kind");
const { value: lastnames } = useField<string>("lastnames");
const { value: names } = useField<string>("names");
const { value: phone } = useField<string>("phone");
const { value: age } = useField<number | null>("age");

const optionsDocuments = computed(() => storeDocumentType().documentType);
const optionsChurches = computed(() => storeChurches().churches);
const optionsKinds = computed(() => storeKind().kinds);

const addDataFromReniec = async(): Promise<void> => {
    loadingSearch.value = true;
    wasDniChecked.value = false;

    const dataConsult = await getDataReniec(doc_num.value);

    if ( !dataConsult || !dataConsult.success) {
        loadingSearch.value = false;
        wasDniChecked.value = true;
        useGlobalToast({
            severity: "warn", summary: "DNI no encontrado", detail: dataConsult?.message || "No se encontró información con ese DNI."
        });
        return;
    }

    const result = dataConsult.data;

    if ("doc_num" in result && "names" in result && "lastnames" in result) {
        const dataConsultDNI = result as MemberExist;
        setValues({
            names: dataConsultDNI.names, lastnames: `${ dataConsultDNI.lastnames }`, phone: dataConsultDNI.phone, kind: dataConsultDNI.kind,
            gender: dataConsultDNI.gender, church: dataConsultDNI.church
        }, false);
    }

    if ("nombre_completo" in result) {
        const dataConsultDNI = result as DataDNI;
        setValues({
            names: dataConsultDNI.nombres, lastnames: `${ dataConsultDNI.apellido_paterno } ${ dataConsultDNI.apellido_materno }`
        }, false);
    }

    wasDniChecked.value = true;
    loadingSearch.value = false;
};

const saveNewMember = handleSubmit(async(values): Promise<void> => {
    if (props.formData?.id) {
        // const parsedDate = typeof values.birthdate === "string" ? parseISO(values.birthdate) : values.birthdate;
        const { response }: UsersActiosMembers = await Api.Put({
            route: `person/${ props.formData?.id }`,
            data: { ...values }
        });
        if (response.status && response.status === 200) {
            props.closeModal();
            await props.refreshData();
            useGlobalToast({ severity: "success", summary: `Miembro ${ response.data.names } ${ response.data.lastnames } editado.` });
        }
    } else {
        if (documenttype.value === 1 && !wasDniChecked.value && !isClickCard.value) {
            useGlobalToast({
                severity: "warn", summary: "Consulta pendiente", detail: "Debes hacer la búsqueda por DNI antes de continuar."
            });
            return;
        }

        if ( !props.formData?.id) {
            membersStoreOptions.addNewMembers(values, clearDataForm, isClickCard.value);
            membersStoreOptions.selectedMember = {} as InterfaceMembers;
            updateVisibilityDrawer();
        }
        isClickCard.value = false;
    }
}, () => {
    useGlobalToast({ severity: "error", summary: "Error al guardar", detail: "Por favor, llene el formulario." });
});

const onClickCardMember = (data: InterfaceMembers) => {
    setValues({ ...data });
    isClickCard.value = true;
};

const clearDataForm = () => handleReset();
const updateVisibilityDrawer = () => refDrawerMembersSaved.value.visibleDrawer = true;

watch(doc_num, () => {
    wasDniChecked.value = false;
});

watch(() => membersStoreOptions.selectedMember, (member) => {
    if (member?.doc_num) {
        setValues({ ...member }, false);
        isClickCard.value = false;
    }
}, { immediate: true });

onMounted(() => {
    if (props.formData?.id) {
        setValues({ ...props.formData }, false);
        isClickCard.value = true;
    }
});

</script>

<template>
    <div class="mx-auto max-w-screen-sm align-items-form sm:px-6 md:px-8 lg:px-10">
        <ValidateFormItem label="Tipo de Documento" cols="12" name="documenttype">
            <Select fluid v-model="documenttype" :options="optionsDocuments" optionLabel="description" option-value="id" size="large"
                    :disabled="isClickCard"/>
        </ValidateFormItem>
        <ValidateFormItem label="DNI" cols="12" name="doc_num" v-slot="{ error }">
            <InputGroup name="doc_num">
                <InputText fluid v-model="doc_num" placeholder="Ingrese nro de DNI" v-key-filter.num maxlength="8"
                           :invalid="!!error" size="large" @keyup.enter="addDataFromReniec"
                           :disabled="isClickCard && !isClickCard && props.formData?.id !== null"/>
                <Button label="Buscar" :disabled="loadingSearch" v-if="documenttype === 1" @click="addDataFromReniec"
                        :loading="loadingSearch" #icon>
                    <i-material-symbols-person-search-outline-rounded/>
                </Button>
            </InputGroup>
        </ValidateFormItem>
        <!--        <ValidateFormItem cols="12" hide-label hide-error v-if="showMessage">-->
        <!--            <view-existed-member :dni="infoMessage.dni" :name="infoMessage.names"/>-->
        <!--        </ValidateFormItem>-->
        <ValidateFormItem label="Nombres" cols="12" name="names" v-slot="{ error }">
            <InputText fluid v-model="names" :invalid="!!error" size="large"
                       :disabled="!wasDniChecked && !isClickCard  && documenttype === 1 && !props.formData?.id"/>
        </ValidateFormItem>
        <ValidateFormItem label="Apellidos" cols="12" name="lastnames" v-slot="{ error }">
            <InputText fluid v-model="lastnames" :invalid="!!error" size="large"
                       :disabled="!wasDniChecked && !isClickCard  && documenttype === 1 && !props.formData?.id"/>
        </ValidateFormItem>
        <ValidateFormItem label="Género" cols="12" name="gender" v-slot="{ error }">
            <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                    <RadioButton v-model="gender" inputId="gender1" name="gender" value="M" :invalid="!!error"/>
                    <label for="gender1">Masculino</label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton v-model="gender" inputId="gender2" name="gender" value="F" :invalid="!!error"/>
                    <label for="gender2">Femenino</label>
                </div>
            </div>
        </ValidateFormItem>
        <ValidateFormItem label="Edad" cols="12" name="gender">
            <InputNumber fluid v-model="age" size="large"/>
        </ValidateFormItem>
        <ValidateFormItem label="Celular" cols="12" name="gender" v-slot="{ error }">
            <InputText fluid v-model="phone" maxlength="9" v-key-filter.num :invalid="!!error" size="large"/>
        </ValidateFormItem>
        <ValidateFormItem label="¿Perteneces a alguna iglesia?" cols="12" name="kind" v-slot="{ error }">
            <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2" v-for="kindData in optionsKinds">
                    <RadioButton v-model="kind" :inputId="kindData.description" :name="kindData.description" :value="kindData.id"
                                 :invalid="!!error" size="large"/>
                    <label :for="kindData.description">{{ kindData.description }}</label>
                </div>
            </div>
        </ValidateFormItem>
        <ValidateFormItem label="Iglesia" cols="12" name="age" v-slot="{ error }">
            <Select :options="optionsChurches" fluid v-model="church" filter show-clear size="large" :invalid="!!error"
                    reset-filter-on-clear reset-filter-on-hide auto-filter-focus optionLabel="description" option-value="id"/>
        </ValidateFormItem>

        <div class="max-cols-4">
            <Button label="Ver Lista" severity="secondary" @click="updateVisibilityDrawer "
                    v-if="membersStoreOptions.membersData.length >= 1 && !props.formData?.id" fluid #icon>
                <i-material-symbols-list-alt-check/>
            </Button>
        </div>
        <div class="max-cols-4">
            <Button label="Limpiar" severity="warn" fluid @click="clearDataForm()" #icon>
                <i-material-symbols-tab-close/>
            </Button>
        </div>
        <div class="max-cols-4">
            <Button :label=" isClickCard || props.formData?.id ? 'Editar' :'¡Agregar!'" @click="saveNewMember()" fluid #icon>
                <i-material-symbols-sync-saved-locally/>
            </Button>
        </div>
    </div>
    <drawer-members-saved ref="refDrawerMembersSaved" @on-click-card="onClickCardMember"/>
</template>
