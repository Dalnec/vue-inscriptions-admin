<script setup lang="ts">
/* general imports */
import { onMounted, ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { useDebounceFn } from "@vueuse/core";
import { Api } from "@/api/connection";
import { useToast } from "primevue/usetoast";
import toastErrorMessageForm from "@/composables/toastEvent.ts";
import type { InterfaceProfile, UsersActiosProfile, UsersActiosMembersActions, InterfaceUsers } from "@/modules/users/interfaceUsers";

/* general variables */
const profileOptions = ref<InterfaceProfile[]>([]);
const props = defineProps<{ closeModal: () => void; refreshData: () => Promise<void>; formData?: InterfaceUsers }>();
const toast = useToast();

/**
 * Scheme of rules to be evaluated
 */
const schemaValidate = ref(yup.object({
        lastname: yup.string().trim().required("Ingrese Apellido").label("Apellido"),
        names: yup.string().trim().required("Ingrese un nombre").label("Nombre"),
        password: yup.string().trim().when("$isNew", {
            is: () => !props.formData?.id,
            otherwise: (schema) => schema.notRequired(),
            then: (schema) => schema.required("Ingrese su contraseña").min(5, "Ingresa al menos 5 caracteres")
        }).label("Contraseña"),
        passwordConfirm: yup.string().trim().when("$isNew", {
            is: () => !props.formData?.id,
            then: (schema) => schema.required("Ingrese la confirmación").oneOf([ yup.ref("password") ], "La contraseña no coincide").min(5, "Ingresa al menos 5 caracteres"),
            otherwise: (schema) => schema.notRequired()
        }).label("Confirm. Contraseña"),
        profile: yup.string().trim().required("Seleccione un perfil").label("Perfil"),
        username: yup.string().trim().when("$isNew", {
            is: () => !props.formData?.id,
            then: (schema) => schema.required("Ingrese su usuario").min(5, "Ingresa al menos 8 caracteres"),
            otherwise: (schema) => schema.notRequired()
        }).label("Usuario")
    })
);

/* initial values of model schema */
const fields = ref<InterfaceUsers>({
    is_active: true,
    email: "",
    names: "",
    password: "",
    passwordConfirm: "",
    profile: null,
    username: "",
    lastname: ""
});

/**
 * add initial values to form, get methods to validate form
 */
const { handleSubmit, resetForm, errors, setValues } = useForm({ validationSchema: schemaValidate, initialValues: fields.value });

/**
 * destructuring of values and methods for handling the form
 */
const { value: names, handleBlur: namesBlur } = useField<string>("names");
const { value: email } = useField<string>("email");
const { value: profile, handleBlur: profileBlur } = useField<string>("profile");
const { value: username, handleBlur: usernameBlur } = useField<string>("username");
const { value: lastname } = useField<string>("lastname");
const { value: password, handleBlur: passwordBlur } = useField<string>("password");
const { value: passwordConfirm, handleBlur: passwordConfirmBlur } = useField<string>("passwordConfirm");

/**
 * call the profile api to get all existing profiles
 */
const getProfilesList = useDebounceFn(async(): Promise<InterfaceProfile[]> => {
    const { response }: UsersActiosProfile = await Api.Get({ route: "profile" });
    if (response.status === 200) {
        return response.data;
    } else return [];
}, 250);

const onSubmit = handleSubmit(async(values) => {
    if (props.formData?.id) {

        delete values.password;
        delete values.passwordConfirm;
        const { response }: UsersActiosMembersActions = await Api.Put({ route: `user/${ props.formData?.id }`, data: { ...values } });
        if (response.status === 201) {
            toast.add({ life: 5000, closable: true, summary: `${ response.data.names } actualizado`, severity: "success" });
            reloadData();
        }
    } else {
        const { response }: UsersActiosMembersActions = await Api.Post({ route: `user`, data: { ...values } });
        if (response.status === 201) {
            reloadData();
            toast.add({ life: 5000, closable: true, summary: "xxx", severity: "success" });
        }
    }
}, ({ errors }) => {
    const errorMessages = Object.entries(errors).map(([ field, message ]) => `${ field }: ${ message }`).join(", ");
    toastErrorMessageForm({ summary: "Campos requeridos: ", message: errorMessages, life: 5000 });
});

/**
 * function Restart form, reload table data, and close modal
 */
const reloadData = () => {
    resetForm();
    props.closeModal();
    props.refreshData();
};

onMounted(async() => {
    // Fetch the list of available profiles
    profileOptions.value = await getProfilesList();

    // Check if the form has an existing ID (editing mode)
    if (props.formData?.id) {
        setValues({ ...props.formData }, false);
    }
});

</script>

<template>
    <div class="align-items-form">
        <form-item for-label="names" label="Nombres" mark :error="errors.names" cols="6">
            <InputText v-model="names" id="names" :invalid="!!errors.names" fluid @blur="namesBlur($event, true)" autocomplete="off"/>
        </form-item>
        <form-item for-label="lastname" label="Apellidos" cols="6">
            <InputText v-model="lastname" id="lastname" fluid autocomplete="off"/>
        </form-item>
        <form-item for-label="email" label="Correo" cols="6">
            <InputText v-model="email" id="email" fluid autocomplete="off"/>
        </form-item>
        <form-item for-label="profile" label="Perfil" cols="4" mark :error="errors.profile">
            <Select v-model="profile" label-id="profile" :invalid="!!errors.profile" :options="profileOptions" name="profile" fluid
                    optionLabel="description" optionValue="id" autocomplete="off" @blur="profileBlur($event, true)" show-clear/>
        </form-item>
        <form-item v-if="!props.formData?.id" for-label="username" label="Usuario" mark :error="errors.username" cols="4">
            <InputText v-model="username" id="username" :invalid="!!errors.username" fluid @blur="usernameBlur($event, true)"
                       max="11" autocomplete="off"/>
        </form-item>
        <form-item v-if="!props.formData?.id" for-label="password" label="Contraseña" mark :error="errors.password" cols="4">
            <Password v-model="password" input-id="password" :invalid="!!errors.password" class="w-full" :toggleMask="true"
                      :feedback="false" @blur="passwordBlur($event, true)" input-class="w-full !py-1.5"/>
        </form-item>
        <form-item v-if="!props.formData?.id" for-label="confirm" label="Confirmar" mark :error="errors.passwordConfirm" cols="4">
            <Password v-model="passwordConfirm" input-id="confirm" :invalid="!!errors.passwordConfirm" class="w-full" :toggleMask="true"
                      :feedback="false" @blur="passwordConfirmBlur($event, true)" input-class="w-full !py-1.5"/>
        </form-item>
        <Divider class="col-span-1 md:col-span-12 !my-2"/>
    </div>

    <div class="mt-4 align-buttons-submit space-x-2">
        <Button label="Cancelar" severity="secondary" raised fluid class="border border-surface-300" @click="reloadData">
            <template #icon>
                <i-ri-close-line class="mx-1"/>
            </template>
        </Button>
        <Button :label="`${!props.formData?.id ? 'Crear' : 'Editar'} Usuario`" fluid @click="onSubmit()">
            <template #icon>
                <i-ri-user-add-line class="mx-1"/>
            </template>
        </Button>
    </div>
</template>
