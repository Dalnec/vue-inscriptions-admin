<script setup lang="ts">

import { computed, onMounted, ref, watch } from "vue";
import { useMembersStore } from "@/stores/storeMembers.ts";
import { storeActivities, storeActivityActive, storeChurches, storeDocumentType, storeKind, storePaymentMethod, storeRate } from "@/stores/generalInfoStore.ts";
import { useField, useForm } from "vee-validate";
import toastEvent from "@/composables/toastEvent.ts";
import type { InterfaceMembers } from "@/types/interfaceMembers.ts";
import type { SelectFilterEvent } from "primevue";
import { type DataDNI, getDataReniec, type MemberExist } from "@/composables/getDataReniec.ts";
import HeaderPage from "@/pages/public/webEvent/HeaderPage.vue";
import * as yup from "yup";

const refDrawerMembersSaved = ref();
const loadingSearch = ref(false);
const membersStoreOptions = useMembersStore();
const isClickCard = ref(false);
const wasDniChecked = ref(false);
const filteredOptions = ref<{ id: number, description: string, active: boolean }[]>([]);
const selectRef = ref();

const props = defineProps({
    closeModal: { default: () => ({}), required: false, type: Function },
    formData: { default: {} as InterfaceMembers, required: false, type: Object },
    refreshData: { default: () => ({}), required: false, type: Function }
});

const validationSchema = ref(yup.object({
    // birthdate: yup.string().required("Agrega una fecha valida"),
    church: yup.string().required("Seleccione una iglesia"),
    doc_num: yup.string().required("Agregue un DNI"),
    documenttype: yup.string().required("Seleccione un tipo de identificación"),
    gender: yup.string().required("Seleccione un género"),
    kind: yup.string().required("Seleccione a donde pertenece"),
    lastnames: yup.string().required("Agregue sus apellidos"),
    names: yup.string().required("Agregue sus nombres"),
    phone: yup.string().required("Añada un teléfono valido")
}));

const { handleReset, handleSubmit, setValues } = useForm<InterfaceMembers>({ initialValues: { documenttype: 1 }, validationSchema });

const { value: church } = useField<number>("church");
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
const optionsKinds = computed(() => storeKind().kind);

const addDataFromReniec = async(): Promise<void> => {
    loadingSearch.value = true;
    wasDniChecked.value = false;

    const dataConsult = await getDataReniec(doc_num.value);

    if ( !dataConsult || !dataConsult.success) {
        loadingSearch.value = false;
        wasDniChecked.value = true;
        toastEvent({
            severity: "warn", summary: "DNI no encontrado", detail: dataConsult?.message || "No se encontró información con ese DNI."
        });
        return;
    }

    const result = dataConsult.data;

    if ("doc_num" in result && "names" in result && "lastnames" in result) {
        const dataConsultDNI = result as MemberExist;
        // showMessage.value = true;
        setValues({
            names: dataConsultDNI.names, lastnames: `${ dataConsultDNI.lastnames }`, phone: dataConsultDNI.phone, kind: dataConsultDNI.kind,
            gender: dataConsultDNI.gender, church: dataConsultDNI.church
        }, false);
        // infoMessage.value = { dni: result.doc_num, names: `${ result.names } ${ result.lastnames }` };
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

const saveNewMember = handleSubmit(async(values) => {
    if (documenttype.value === 1 && !wasDniChecked.value && !isClickCard.value) {
        toastEvent({ severity: "warn", summary: "Consulta pendiente", detail: "Debes hacer la búsqueda por DNI antes de continuar." });
        return;
    }

    if ( !props.formData?.id) {
        membersStoreOptions.addNewMembers(values, clearDataForm, isClickCard.value);
        updateVisibilityDrawer();
    }

    isClickCard.value = false;
}, ({ errors }) => {
    const errorMessages = Object.entries(errors).map(([ field, message ]) => `${ field }: ${ message }`).join(", \n");
    toastEvent({ summary: "Campos requeridos: ", detail: errorMessages, life: 5000 });
});

const onClickCardMember = (data: InterfaceMembers) => {
    setValues({ ...data });
    isClickCard.value = true;
};

const clearDataForm = () => {
    handleReset();
};

const updateVisibilityDrawer = () => refDrawerMembersSaved.value.visibleDrawer = true;

const onFilter = (event: SelectFilterEvent) => {
    const query = (event.value || "").toString().toLowerCase().trim();

    filteredOptions.value = optionsChurches.value.filter((dt) => dt.description.toLowerCase().includes(query));
};

const onEnter = () => {
    if ( !filteredOptions.value.length) return;

    const first = filteredOptions.value[0];

    church.value = first.id;
    selectRef.value?.hide();
};

watch(doc_num, () => {
    wasDniChecked.value = false;
});

onMounted(async() => {
    await Promise.all([
        await storeChurches().getDataChurches(),
        await storeDocumentType().getDocumentType(),
        await storePaymentMethod().getPaymentMethod(),
        await storeActivities().getActivities(),
        await storeRate().getRates(),
        await storeKind().getKinds(),
        await storeActivityActive().getActiveActivity()
    ]);
});

</script>

<template>
    <main class="bg-slate-900 text-white min-h-screen flex flex-col">
        <HeaderPage/>
        <div class="form-wrapper">
            <!-- HEADER -->
            <div class="form-header">
                <h2>Inscripción al evento</h2>
                <p>Completa tus datos para asegurar tu participación</p>
            </div>

            <!-- BLOQUE 1 -->
            <div class="form-card">
                <h3 class="form-section-title">Identificación</h3>

                <div class="form-grid">
                    <ValidateFormItem label="Tipo de Documento">
                        <Select v-model="documenttype" :options="optionsDocuments" optionLabel="description" optionValue="id" size="large"
                                placeholder="Seleccione" fluid :disabled="isClickCard"/>
                    </ValidateFormItem>

                    <ValidateFormItem label="DNI">
                        <InputGroup>
                            <InputText v-model="doc_num" placeholder="Ej: 12345678" size="large" maxlength="8"
                                       @keyup.enter="addDataFromReniec()" :disabled="isClickCard && !isClickCard"/>
                            <Button label="Buscar" @click="addDataFromReniec" :loading="loadingSearch" :disabled="isClickCard"
                                    v-if="documenttype === 1"/>
                        </InputGroup>
                    </ValidateFormItem>
                </div>
            </div>

            <!-- BLOQUE 2 -->
            <div class="form-card">
                <h3 class="form-section-title">Datos personales</h3>

                <div class="form-grid">
                    <ValidateFormItem label="Nombres">
                        <InputText v-model="names" fluid size="large" placeholder="Juan" :disabled="!wasDniChecked && documenttype === 1"/>
                    </ValidateFormItem>

                    <ValidateFormItem label="Apellidos">
                        <InputText v-model="lastnames" fluid size="large" placeholder="Picasso"
                                   :disabled="!wasDniChecked && documenttype === 1"/>
                    </ValidateFormItem>

                    <ValidateFormItem label="Edad">
                        <InputNumber v-model="age" fluid size="large" placeholder="ingrese una edad"/>
                    </ValidateFormItem>

                    <ValidateFormItem label="Género">
                        <div class="radio-group">
                            <RadioButton v-model="gender" value="M" size="large"/>
                            Masculino
                            <RadioButton v-model="gender" value="F" size="large"/>
                            Femenino
                        </div>
                    </ValidateFormItem>
                </div>
            </div>

            <!-- BLOQUE 3 -->
            <div class="form-card">
                <h3 class="form-section-title">Contacto</h3>

                <ValidateFormItem label="Celular">
                    <InputText v-model="phone" size="large"/>
                </ValidateFormItem>
            </div>

            <!-- BLOQUE 4 -->
            <div class="form-card">
                <h3 class="form-section-title">Información adicional</h3>

                <ValidateFormItem label="¿Perteneces a una iglesia?">
                    <div class="radio-group">
                        <div v-for="kindData in optionsKinds" :key="kindData.id">
                            <RadioButton v-model="kind" :value="kindData.id" size="large"/>
                            {{ kindData.description }}
                        </div>
                    </div>
                </ValidateFormItem>

                <ValidateFormItem label="Iglesia" name="church">
                    <Select v-model="church" :options="optionsChurches" optionLabel="description" optionValue="id" labelId="church"
                            size="large" placeholder="Seleccione su iglesia" fluid filter autoFilterFocus resetFilterOnHide
                            resetFilterOnClear highlightOnSelect checkmark focusOnHover @filter="onFilter"
                            @keyup.enter="onEnter"/>
                </ValidateFormItem>
            </div>

            <!-- ACCIONES -->
            <div class="form-actions">
                <Button label="Cancelar" severity="secondary" @click="clearDataForm" fluid/>
                <Button label="Guardar inscripción" @click="saveNewMember" fluid/>
            </div>
        </div>
        <DrawerMembersSaved ref="refDrawerMembersSaved" @on-click-card="onClickCardMember"/>
    </main>
</template>

<style>
.form-wrapper {
    @apply max-w-3xl mx-auto px-4 md:px-6;
}

.form-header {
    @apply text-center mb-10;
}

.form-header h2 {
    @apply text-3xl md:text-4xl text-white font-semibold;
}

.form-header p {
    @apply text-slate-400 mt-2;
}

.form-card {
    @apply bg-white/5 backdrop-blur-md border border-white/10
    rounded-2xl p-5 md:p-6 mb-6;
}

.form-section-title {
    @apply text-white text-lg font-semibold mb-4;
}

.form-grid {
    @apply grid md:grid-cols-2 gap-4;
}

.radio-group {
    @apply flex flex-wrap gap-4;
}

.form-actions {
    @apply flex flex-col md:flex-row gap-3 my-6;
}

</style>