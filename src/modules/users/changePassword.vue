<script setup lang="ts">

import { ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { Api } from "@/api/connection";
import { useToast } from "primevue";
import type { UsersActiosMembersActions } from "@/modules/users/interfaceUsers.ts";

const props = defineProps<{ userID: number | undefined; closeForm: () => void; }>();
const fields = ref({ password: "", passwordConfirm: "" });
const toast = useToast();

const schemaValidate = ref(yup.object({
    password: yup.string().trim().when("$isNew", {
        is: () => props.userID,
        then: (schema) => schema.required("Ingrese su contraseña").min(8, "Ingresa al menos 8 caracteres"),
        otherwise: (schema) => schema.notRequired()
    }).label("Contraseña"),
    passwordConfirm: yup.string().trim().when("$isNew", {
        is: () => props.userID,
        then: (schema) => schema.required("Ingrese la confirmación").oneOf([ yup.ref("password") ], "La contraseña no coincide").min(8, "Ingresa al menos 8 caracteres"),
        otherwise: (schema) => schema.notRequired()
    }).label("Confirm. Contraseña")
}));

const { handleSubmit, errors } = useForm({ validationSchema: schemaValidate, initialValues: fields.value });

const { value: password, handleBlur: passwordHandleBlur } = useField<string>("password");
const { value: passwordConfirm, handleBlur: passwordConfirmHandleBlur } = useField<string>("passwordConfirm");

const saveChangePassword = handleSubmit(async(values) => {
    const { response }: UsersActiosMembersActions = await Api.Put({
        route: `user/${ props.userID }/change_password`, data: { password: values.password, password2: values.passwordConfirm }
    });
    if (response && response.status === 200) {
        toast.add({ severity: "success", life: 5000, summary: "Contraseña actualizada correctamente" });
        props.closeForm();
    } else {
        toast.add({ severity: "error", life: 5000, summary: "Error al cambiar contraseña" });
    }
}, ({ errors }) => {
    const errorMessages: string = Object?.["entries"](errors).map(([ field, message ]) => `${ field }: ${ message }`).join(", ");
    toast.add({ severity: "error", summary: "Error", detail: `Complete los siguientes campos:\n ${ errorMessages }`, life: 10000 });
});

</script>

<template>
    <div class="align-items-form">
        <form-item mark cols="6" label="Nueva Contraseña" :error="errors.password">
            <Password v-model="password" fluid @blur="passwordHandleBlur($event, true)" input-id="password"
                      :invalid="!!errors.password" class="w-full" :toggleMask="true" :feedback="false"/>
        </form-item>
        <form-item mark cols="6" label="Confirmar Contraseña" :error="errors.passwordConfirm">
            <Password v-model="passwordConfirm" fluid :invalid="!!errors.passwordConfirm" @blur="passwordConfirmHandleBlur($event, true)"
                      input-id="password" class="w-full" :toggleMask="true" :feedback="false"/>
        </form-item>
    </div>
    <div class="align-buttons-submit">
        <Button severity="secondary" raised fluid label="Cancelar" @click="props.closeForm()"></Button>
        <Button raised fluid label="Confirmar" @click="saveChangePassword"></Button>
    </div>
</template>
