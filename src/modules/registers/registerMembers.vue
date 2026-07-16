<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { useMembersStorePage } from "@/stores/StoreMembersPage.ts";
import { computed, onMounted, ref, watch } from "vue";
import { storeChurches, storeDocumentType, storeKind, storeRate } from "@/stores/generalInfoStore.ts";
import { useField, useForm } from "vee-validate";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import useGlobalToast from "@/composables/toastEvent";
import type { InterfaceMembers, UsersActiosMembers } from "@/types/interfaceMembers.ts";
import { type DataDNI, getDataReniec, type MemberExist } from "@/composables/getDataReniec.ts";
import DrawerMembersSaved from "@/components/drawerMembersSaved.vue";
import * as yup from "yup";
import type { SelectFilterEvent } from "primevue";
import toastEvent from "@/composables/toastEvent.ts";
import router from "@/router";
import { useRoute } from "vue-router";
import type { InterfaceRatesResponse } from "@/types/InterfaceRates.ts";

const filteredOptions = ref<{ id: number, description: string, active: boolean }[]>([]);
const selectRef = ref();
const refDrawerMembersSaved = ref();
const loadingSearch = ref(false);
const membersStoreOptions = useMembersStorePage();
const isClickCard = ref(false);
const wasDniChecked = ref(false);
const useStoreDocumentType = storeDocumentType();
const useStoreChurches = storeChurches();
const useStoreKind = storeKind();
const useStoreRates = storeRate();

const route = useRoute();

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
const { value: church } = useField<number>("church");
const { value: doc_num } = useField<string>("doc_num");
const { value: documenttype } = useField<number>("documenttype");
const { value: gender } = useField<string>("gender");
const { value: kind } = useField<number>("kind");
const { value: lastnames } = useField<string>("lastnames");
const { value: names } = useField<string>("names");
const { value: phone } = useField<string>("phone");
const { value: email } = useField<string>("email");
const { value: age } = useField<number | null>("age");

const optionsDocuments = computed(() => useStoreDocumentType.documentType);
const optionsChurches = computed(() => useStoreChurches.churches);
const optionsKinds = computed(() => useStoreKind.kinds);

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
        handleReset();
        const dataConsultDNI = result as MemberExist;
        setValues({
            names: dataConsultDNI.names, lastnames: `${ dataConsultDNI.lastnames }`, phone: dataConsultDNI.phone, kind: dataConsultDNI.kind,
            gender: dataConsultDNI.gender, church: dataConsultDNI.church, doc_num: dataConsultDNI.doc_num
        }, false);
    }

    if ("nombre_completo" in result) {
        const dataConsultDNI = result as DataDNI;
        // handleReset()
        setValues({
            names: dataConsultDNI.nombres, lastnames: `${ dataConsultDNI.apellido_paterno } ${ dataConsultDNI.apellido_materno }`,
            doc_num: dataConsultDNI.numero
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
}, ({ errors }) => castFormErrors(errors));

const onClickCardMember = (data: InterfaceMembers) => {
    setValues({ ...data });
    isClickCard.value = true;
};

const clearDataForm = () => handleReset();
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


const onGetRates = async() => {
    const { response }: InterfaceRatesResponse = await Api.Get({
        params: { activity_shortname: route.params.slug, active: true },
        route: "tarifa"
    });
    if (response && response?.status === 200) {
        useStoreRates.rate = response.data.results;
        if (useStoreRates.rate.length === 0) {
            toastEvent({ severity: "error", summary: "No hay tarifas disponibles, el registro no procederá" });
            await router.push({ name: "webPage", params: { slug: route.params.slug } });
        }
    }
};


watch(doc_num, () => {
    wasDniChecked.value = false;
});

watch(() => membersStoreOptions.selectedMember, (member) => {
    if (member?.doc_num) {
        setValues({ ...member }, false);
        isClickCard.value = false;
    }
}, { immediate: true });

onMounted(async() => {
    await onGetRates();
    await useStoreDocumentType.getDocumentType();
    await useStoreChurches.getDataChurches();
    await useStoreKind.getKinds();

    if (props.formData?.id) {
        setValues({ ...props.formData }, false);
        isClickCard.value = true;
    }
});

</script>

<template>
    <div class="max-w-3xl mx-auto px-4 md:px-6">
        <div class="form-card-page">
            <h3 class="form-section-title">Identificación</h3>

            <div class="form-grid-page">
                <ValidateFormItem label="Tipo de Documento" name="documenttype">
                    <Select fluid v-model="documenttype" :options="optionsDocuments" optionLabel="description" option-value="id"
                            size="large" :disabled="isClickCard"/>
                </ValidateFormItem>
                <ValidateFormItem label="DNI" name="doc_num" v-slot="{ error }">
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
            </div>
        </div>

        <div class="form-card-page">

            <h3 class="form-section-title">Datos personales</h3>

            <div class="form-grid">

                <ValidateFormItem label="Nombres" name="names" v-slot="{ error }">
                    <InputText fluid v-model="names" :invalid="!!error" size="large"
                               :disabled="!wasDniChecked && !isClickCard  && documenttype === 1 && !props.formData?.id"/>
                </ValidateFormItem>
                <ValidateFormItem label="Apellidos" name="lastnames" v-slot="{ error }">
                    <InputText fluid v-model="lastnames" :invalid="!!error" size="large"
                               :disabled="!wasDniChecked && !isClickCard  && documenttype === 1 && !props.formData?.id"/>
                </ValidateFormItem>
                <ValidateFormItem label="Edad" name="age">
                    <InputNumber v-model="age" fluid size="large" placeholder="ingrese una edad"/>
                </ValidateFormItem>

                <ValidateFormItem label="Género" name="gender" v-slot="{ error }">
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
            </div>
        </div>

        <div class="form-card-page">
            <h3 class="form-section-title">Contacto</h3>
            <div class="form-grid-page">
                <ValidateFormItem label="Celular" name="phone" v-slot="{ error }">
                    <InputText fluid v-model="phone" maxlength="9" v-key-filter.num :invalid="!!error" size="large"/>
                </ValidateFormItem>
                <ValidateFormItem label="Correo" name="email" v-slot="{ error }">
                    <InputText fluid v-model="email" :invalid="!!error" size="large"/>
                </ValidateFormItem>
            </div>
        </div>

        <div class="form-card-page">

            <h3 class="form-section-title">Información adicional</h3>

            <ValidateFormItem label="¿Perteneces a alguna iglesia?" span="12" name="kind" v-slot="{ error }">
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center gap-2" v-for="kindData in optionsKinds">
                        <RadioButton v-model="kind" :inputId="kindData.description" :name="kindData.description" :value="kindData.id"
                                     :invalid="!!error" size="large"/>
                        <label :for="kindData.description">{{ kindData.description }}</label>
                    </div>
                </div>
            </ValidateFormItem>
            <ValidateFormItem label="Iglesia" span="12" name="church" v-slot="{ error }">
                <Select :options="optionsChurches" fluid v-model="church" filter show-clear size="large" :invalid="!!error"
                        resetFilterOnClear resetFilterOnHide autoFilterFocus optionLabel="description" option-value="id" @filter="onFilter"
                        @keyup.enter="onEnter"/>
            </ValidateFormItem>
        </div>

        <div class="form-actions-page">

            <Button label="Ver Lista" severity="secondary" @click="updateVisibilityDrawer "
                    v-if="membersStoreOptions.membersData.length >= 1 && !props.formData?.id" fluid #icon>
                <i-material-symbols-list-alt-check/>
            </Button>

            <Button label="Limpiar" severity="warn" fluid @click="clearDataForm()" #icon>
                <i-material-symbols-tab-close/>
            </Button>

            <Button :label=" isClickCard || props.formData?.id ? 'Editar' :'¡Agregar!'" @click="saveNewMember()" fluid #icon>
                <i-material-symbols-sync-saved-locally/>
            </Button>
        </div>
    </div>
    <drawer-members-saved ref="refDrawerMembersSaved" @on-click-card="onClickCardMember" redirectUrl="payEvent" isPage
                          urlToAdd="newRegister"/>
</template>

<style>

.form-card-page {
    @apply bg-surface-100 dark:bg-white/5 backdrop-blur-md border border-surface-200 dark:border-white/10
    rounded-2xl p-5 md:p-6 mb-6 text-surface-900 dark:text-white;
}

.form-grid-page {
    @apply grid md:grid-cols-2 gap-4;
}

.form-actions-page {
    @apply flex flex-col md:flex-row gap-3 my-6;
}

</style>