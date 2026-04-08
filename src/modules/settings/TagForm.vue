<script setup lang="ts">
import { InputText, ColorPicker, Button } from "primevue";
import { useForm } from "vee-validate";
import { Api } from "@/api/connection.ts";
import { onMounted, ref } from "vue";
import useGlobalToast from "@/composables/toastEvent.ts";
import * as yup from "yup";

const props = defineProps<{ closeModal: () => void, form: { name: string, color: string, id?: number }, refreshData: () => Promise<void> }>();

const loading = ref(false);

const validationSchema = yup.object({
    name: yup.string().required("El nombre es requerido"),
    color: yup.string().required("El color es requerido")
});

const { handleSubmit, setValues, defineField } = useForm<{ id: number, name: string, color: string }>({
    initialValues: {
        color: "",
        name: ""
    },
    validationSchema
});

const [ name ] = defineField("name");
const [ color ] = defineField("color");

const onSaveTag = handleSubmit(async(values) => {
    loading.value = true;
    const isEdit = values.id;
    const route = isEdit ? `tag/${ values.id }` : "tag";
    const method = isEdit ? Api.Put : Api.Post;
    const { response } = await method({
        data: {
            ...values,
            color: values.color.includes("#") ? values.color : `#${ values.color }`
        }, route
    });
    if (response && [ 200, 201 ].includes(response.status)) {
        await props.refreshData();
        useGlobalToast({ summary: isEdit ? "Etiqueta actualizada" : "Etiqueta creada", severity: "success" });
        loading.value = false;
        props.closeModal();
    }
});

onMounted(() => {
    if (props.form?.id) setValues(props.form);
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem label="Nombre" span="6" mark name="name" v-slot="{ error }">
            <InputText id="name" v-model="name" :invalid="!!error" fluid/>
        </ValidateFormItem>
        <ValidateFormItem label="Color" span="6" mark name="color" v-slot="{ error }">
            <ColorPicker v-model="color" :invalid="!!error" fluid/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button fluid label="Cancelar" severity="secondary" :loading @click="closeModal"/>
        <Button fluid :label="props.form?.id ? 'Actualizar' : 'Crear'" :loading @click="onSaveTag"/>
    </div>
</template>
