<script setup lang="ts">

import type { InterfaceRates } from "@/types/InterfaceRates.ts";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { onMounted, ref } from "vue";
import { Api } from "@/api/connection.ts";
import toastEvent from "@/composables/toastEvent.ts";

const props = defineProps<{ formData?: InterfaceRates, closeModal: () => boolean, refreshData: () => Promise<void> }>();
const loading = ref(false);
const fieldInitial = ref<InterfaceRates>({ active: true, description: "", price: "", selected: true });

const validationSchema = yup.object({
    description: yup.string().required("Agregue un nombre de cuenta")
});

const { errors, handleSubmit, setValues } = useForm({ validationSchema, initialValues: fieldInitial.value });

const { value: description } = useField<string>("description");
const { value: price } = useField<string>("price");
const { value: selected } = useField<boolean>("selected");
const { value: active } = useField<boolean>("active");

const onSavePayments = handleSubmit(async(values) => {
    loading.value = true;
    const isUpdate = !!props.formData?.id;
    const route = `tarifa${ isUpdate ? `/${ props.formData.id }` : "" }`;
    const method = isUpdate ? Api.Put : Api.Post;
    const { response } = await method({ route, data: { ...values } });
    if (response && [ 200, 201 ].includes(response.status)) {
        loading.value = false;
        toastEvent({ severity: "success", summary: `Datos ${ isUpdate ? "editados" : "agregados" }` });
        await props.refreshData();
        props.closeModal();
    }
});

onMounted(() => {
    if (props.formData?.id) setValues({ ...props.formData });
});

</script>

<template>
    <div class="align-items-form">
        <FormItem label="Descripción" cols="12" :error="errors.description">
            <InputText fluid v-model="description"/>
        </FormItem>
        <FormItem label="Precio" cols="6" :error="errors.price">
            <InputText fluid v-model="price" v-key-filter.num/>
        </FormItem>
        <FormItem label="Seleccionable" cols="3" :error="errors.selected">
            <ToggleSwitch fluid v-model="selected"/>
        </FormItem>
        <FormItem label="Activo" cols="3" :error="errors.active">
            <ToggleSwitch fluid v-model="active"/>
        </FormItem>
        <FormItem hide-label hide-error cols="6">
            <Button label="Cancelar" @click="props.closeModal()" fluid/>
        </FormItem>
        <FormItem hide-label hide-error cols="6">
            <Button :label="props.formData?.id ? 'Editar' : 'Crear'" @click="onSavePayments" :loading fluid/>
        </FormItem>
    </div>
</template>
