<script setup lang="ts">

import { ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { Api } from "@/api/connection";
import type { UsersActiosMembersActions } from "@/types/interfaceUsers.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";

const props = defineProps<{ userID: number | undefined; closeForm: () => void; }>();
const fields = ref({ password: "", confirm: "" });

const schemaValidate = ref(yup.object({
    password: yup.string().trim().when("$isNew", {
        is: () => props.userID,
        otherwise: (schema) => schema.notRequired(),
        then: (schema) => schema.required("Ingrese su contraseña").min(5, "Ingresa al menos 5 caracteres")
    }).label("Contraseña"),
    confirm: yup.string().trim().when("$isNew", {
        is: () => props.userID,
        otherwise: (schema) => schema.notRequired(),
        then: (schema) => schema.required("Ingrese la confirmación").oneOf([ yup.ref("password") ], "La contraseña no coincide").min(5, "Ingresa al menos 5 caracteres")
    }).label("Confirm. Contraseña")
}));

const { handleSubmit } = useForm({ validationSchema: schemaValidate, initialValues: fields.value });

const { value: password } = useField<string>("password");
const { value: confirm } = useField<string>("confirm");

const saveChangePassword = handleSubmit(async(values) => {
    const { response }: UsersActiosMembersActions = await Api.Put({
        route: `user/${ props.userID }/change_password`, data: { password: values.password, password2: values.confirm }
    });
    if (response && response.status === 200) {
        useGlobalToast({ severity: "success", life: 5000, summary: "Contraseña actualizada correctamente" });
        props.closeForm();
    } else {
        useGlobalToast({ severity: "error", life: 5000, summary: "Error al cambiar contraseña" });
    }
}, ({ errors }) => castFormErrors(errors));

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="6" label="Nueva Contraseña" name="password" v-slot="{ error }">
            <Password v-model="password" fluid input-id="password" :invalid="!!error" class="w-full" :toggleMask="true" :feedback="false"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="6" label="Confirmar Contraseña" name="confirm" v-slot="{ error }">
            <Password v-model="confirm" fluid :invalid="!!error" input-id="password" class="w-full" :toggleMask="true" :feedback="false"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button severity="secondary" raised fluid label="Cancelar" @click="props.closeForm()"></Button>
        <Button raised fluid label="Confirmar" @click="saveChangePassword"></Button>
    </div>
</template>
