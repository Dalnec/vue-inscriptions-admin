<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import { useField, useForm } from "vee-validate";
import { setDefaultImages } from "@/composables/convertImageToUpload.ts";
import { useRoute } from "vue-router";
import toastEvent from "@/composables/toastEvent.ts";
import type { InterfaceActivities, InterfaceResponseActivities, PaymentMethod } from "@/types/interfaceActivities.ts";
import * as yup from "yup";

const props = defineProps<{ formData?: PaymentMethod, closeModal: () => void, refreshData: () => Promise<void> }>();
const fileAccept = ref<string>("image/*,.ico,image/x-icon,image/vnd.microsoft.icon");
const refVoucherImage = ref();
const uploadedFile = ref<File | null>(null);
const activitiesOptions = ref<InterfaceActivities[]>([]);
const route = useRoute();

const fieldInitial = ref<Partial<PaymentMethod>>({ account: "", cci: "", description: "", icon: "", active: true });

const validationSchema = yup.object({
    description: yup.string().required("Agregue un nombre de cuenta")
});

const { handleSubmit, setValues } = useForm({ validationSchema, initialValues: fieldInitial.value });

const { value: account } = useField<string>("account");
const { value: cci } = useField<string>("cci");
const { value: activity } = useField<number | null>("activity");
const { value: description } = useField<string>("description");
const { value: active } = useField<boolean>("active");
const { value: icon, setValue: setValueIcon } = useField<string>("icon");

const onSavePayments = handleSubmit(async() => {
    const formData = new FormData();
    formData.append("account", account.value || "");
    formData.append("cci", cci.value || "");
    formData.append("activity", String(activity.value));
    formData.append("description", description.value || "");
    formData.append("active", "true");

    // Solo agregar el archivo si existe
    if (uploadedFile.value) {
        formData.append("icon", uploadedFile.value);
    }

    let route = "paymentMethod";

    if (props.formData?.id) {
        route = `paymentMethod/${ props.formData.id }`;
    }

    const method = props.formData?.id ? Api.Put : Api.Post;
    const { response } = await method({ route, data: formData });

    if (response && response.status === 200 || response.status === 201) {
        toastEvent({ severity: "success", summary: props.formData?.id ? "Datos editados" : "Datos agregados" });
        await props.refreshData();
        props.closeModal();
    }
});

const handleFileSelect = (event: any) => {
    const file = event.files?.[0];
    if (file) {
        uploadedFile.value = file;
        setValueIcon(file.name);
    }
};

const onGetActivities = async() => {
    const { response }: InterfaceResponseActivities = await Api.Get({
        route: "activity",
        params: {
            shortname: route.params?.slug || ""
        }
    });
    if (response && response.status === 200) {
        return response.data;
    }
    return [] as InterfaceActivities[];
};

onMounted(async() => {
    if (props.formData?.id) {
        setValues({ ...props.formData });
        if (props.formData?.icon) {
            await setDefaultImages(props.formData.icon, refVoucherImage, icon, props.formData.description);
        }
    }
    activitiesOptions.value = await onGetActivities();
    activity.value = activitiesOptions.value.find((item) => item.shortname === route.params?.slug)?.id || null;
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem label="Nombre de cuenta" span="12" mark name="description">
            <InputText v-model="description" fluid/>
        </ValidateFormItem>
        <ValidateFormItem label="Nro de cuenta" span="12">
            <InputText v-model="account" fluid/>
        </ValidateFormItem>
        <ValidateFormItem label="CCI" span="12">
            <InputText v-model="cci" fluid/>
        </ValidateFormItem>
        <ValidateFormItem label="Activo" span="4">
            <ToggleSwitch v-model="active" fluid/>
        </ValidateFormItem>
        <ValidateFormItem label="Icono" span="4">
            <FileUpload name="icon" :accept="fileAccept" :max-file-size="1000000" :file-limit="1" class="w-full" input-id="icon"
                        ref="refVoucherImage" @select="handleFileSelect" :show-upload-button="false" :show-cancel-button="false"
                        @remove="() => { setValueIcon(''); uploadedFile = null }" invalid-file-size-message="Peso de imagen invalido"
                        v-model="icon" invalid-file-limit-message="1 imagen máximo."/>
        </ValidateFormItem>
        <ValidateFormItem hide-label hide-error span="6">
            <Button label="Cancelar" severity="secondary" fluid @click="props.closeModal()"/>
        </ValidateFormItem>
        <ValidateFormItem hide-label hide-error span="6">
            <Button :label="props.formData?.id ? 'Editar' : 'Crear'" fluid @click="onSavePayments"/>
        </ValidateFormItem>
    </div>
</template>
