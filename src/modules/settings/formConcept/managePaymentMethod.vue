<script setup lang="ts">
import type { PaymentMethod } from "@/types/interfaceActivities.ts";
import { onMounted, ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { Api } from "@/api/connection.ts";
import toastEvent from "@/composables/toastEvent.ts";
import { setDefaultImages } from "@/composables/convertImageToUpload.ts";

const props = defineProps<{ formData?: PaymentMethod, closeModal: () => boolean, refreshData: () => Promise<void> }>();
const fileAccept = ref<string>("image/png, image/jpeg, image/jpg");
const refVoucherImage = ref();
const uploadedFile = ref<File | null>(null);

const fieldInitial = ref<PaymentMethod>({ account: "", cci: "", description: "", icon: "", active: true });

const validationSchema = yup.object({
    description: yup.string().required("Agregue un nombre de cuenta")
});

const { errors, handleSubmit, setValues } = useForm({ validationSchema, initialValues: fieldInitial.value });

const { value: account } = useField<string>("account");
const { value: cci } = useField<string>("cci");
const { value: description } = useField<string>("description");
const { value: icon, setValue: setValueIcon } = useField<string>("icon");

const onSavePayments = handleSubmit(async() => {
    const formData = new FormData();
    formData.append("account", account.value || "");
    formData.append("cci", cci.value || "");
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

onMounted(async() => {
    if (props.formData?.id) {
        setValues({ ...props.formData });
        if (props.formData?.icon) {
            await setDefaultImages(props.formData.icon, refVoucherImage, icon, props.formData.description);
        }
    }
});

</script>

<template>
    <div class="align-items-form">
        <FormItem label="Nombre de cuenta" cols="4" :error="errors.description" mark>
            <InputText v-model="description" fluid/>
        </FormItem>
        <FormItem label="Nro de cuenta" cols="4">
            <InputText v-model="account" fluid/>
        </FormItem>
        <FormItem label="CCI" cols="4">
            <InputText v-model="cci" fluid/>
        </FormItem>
        <FormItem label="Icono" cols="7">
            <FileUpload name="icon" :accept="fileAccept" :max-file-size="1000000" :file-limit="1" class="w-full" input-id="icon"
                        ref="refVoucherImage" @select="handleFileSelect" :show-upload-button="false" :show-cancel-button="false"
                        @remove="() => { setValueIcon(''); uploadedFile = null }" invalid-file-size-message="Peso de imagen invalido"
                        v-model="icon" invalid-file-limit-message="1 imagen máximo."/>
        </FormItem>
        <FormItem hide-label hide-error cols="6">
            <Button label="Cancelar" severity="secondary" fluid @click="props.closeModal()"/>
        </FormItem>
        <FormItem hide-label hide-error cols="6">
            <Button :label="props.formData?.id ? 'Editar' : 'Crear'" fluid @click="onSavePayments"/>
        </FormItem>
    </div>
</template>
