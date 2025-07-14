<script setup lang="ts">

import type { InterfaceRates } from "@/types/InterfaceRates.ts";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { onMounted, ref } from "vue";
import { Api } from "@/api/connection.ts";
import toastEvent from "@/composables/toastEvent.ts";

const props = defineProps<{ formData?: InterfaceRates, closeModal: () => boolean, refreshData: () => Promise<void> }>();

const fieldInitial = ref<InterfaceRates>({
    active: true,
    description: "",
    price: "",
    selected: true
});

const validationSchema = yup.object({
    description: yup.string().required("Agregue un nombre de cuenta")
});

const { errors, handleSubmit, setValues } = useForm({ validationSchema, initialValues: fieldInitial.value });

const { value: description } = useField<string>("description");
const { value: price } = useField<string>("price");
const { value: selected } = useField<boolean>("selected");
const { value: active } = useField<boolean>("active");

const onSavePayments = handleSubmit(async(values) => {
    if (props.formData?.id) {
        const { response } = await Api.Post({
            route: `tarifa /${ values.id }`,
            data: { ...values }
        });
        if (response && response.status === 201) {
            toastEvent({ severity: "success", summary: "Datos Agregados" });
            await props.refreshData();
            props.closeModal();
        }
    } else {
        const { response } = await Api.Post({ route: "tarifa", data: { ...values } });
        if (response && response.status === 200) {
            toastEvent({ severity: "success", summary: "Datos editados" });
            await props.refreshData();
            props.closeModal();
        }
    }
});

onMounted(() => {
    if (props.formData?.id) {
        setValues({ ...props.formData });
    }
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
            <Button :label="props.formData?.id ? 'Editar' : 'Crear'" @click="onSavePayments" fluid/>
        </FormItem>
    </div>
</template>
