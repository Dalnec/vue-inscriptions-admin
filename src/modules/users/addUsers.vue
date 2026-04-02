<script setup lang="ts">
/* general imports */
import { Api } from "@/api/connection";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import { onMounted, provide, ref } from "vue";
import { useField, useForm } from "vee-validate";
import { useDebounceFn } from "@vueuse/core";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { InterfaceProfile, UsersActionsProfile, UsersActiosMembersActions, InterfaceUsers } from "@/types/interfaceUsers.ts";
import type { InterfaceActivities, InterfaceResponseActivities } from "@/types/interfaceActivities.ts";
import PermissionsManager from "@/modules/users/PermissionsManager.vue";
import * as yup from "yup";
import type { PermissionsInfo } from "@/types/InterfaceLogin.ts";

/* general variables */
const profileOptions = ref<InterfaceProfile[]>([]);
const activityOptions = ref<InterfaceActivities[]>([]);
const props = defineProps<{ closeModal: () => void; refreshData: () => Promise<void>; formData?: InterfaceUsers }>();
const refPermissions = ref();
const checkAll = ref(false);

/**
 * Scheme of rules to be evaluated
 */
const schemaValidate = ref(yup.object({
        lastname: yup.string().trim().required("Ingrese Apellido").label("Apellido"),
        names: yup.string().trim().required("Ingrese un nombre").label("Nombre"),
        password: yup.string().trim().when("$isNew", {
            is: () => !props.formData?.id,
            otherwise: (schema) => schema.notRequired(),
            then: (schema) => schema.required("Ingrese su contraseña").min(4, "Ingresa al menos 4 caracteres")
        }).label("Contraseña"),
        passwordConfirm: yup.string().trim().when("$isNew", {
            is: () => !props.formData?.id,
            then: (schema) => schema.required("Ingrese la confirmación").oneOf([ yup.ref("password") ], "La contraseña no coincide").min(4, "Ingresa al menos 4 caracteres"),
            otherwise: (schema) => schema.notRequired()
        }).label("Confirm. Contraseña"),
        profile: yup.string().trim().required("Seleccione un perfil").label("Perfil"),
        username: yup.string().trim().when("$isNew", {
            is: () => !props.formData?.id,
            then: (schema) => schema.required("Ingrese su usuario").min(4, "Ingresa al menos 8 caracteres"),
            otherwise: (schema) => schema.notRequired()
        }).label("Usuario")
    })
);

/* initial values of model schema */
const fields = ref<Partial<InterfaceUsers>>({
    is_active: true
});

/**
 * add initial values to form, get methods to validate form
 */
const { handleSubmit, resetForm, setValues } = useForm<InterfaceUsers>({
    validationSchema: schemaValidate, initialValues: fields.value
});

/**
 * destructuring of values and methods for handling the form
 */
const { value: names, handleBlur: namesBlur } = useField<string>("names");
const { value: email } = useField<string>("email");
const { value: profile, handleBlur: profileBlur } = useField<string>("profile");
const { value: activity, handleBlur: activityBlur } = useField<string>("activity");
const { value: username, handleBlur: usernameBlur } = useField<string>("username");
const { value: permissions, handleBlur: handleBlurPermissions } = useField<PermissionsInfo[]>("permissions");
const { value: lastname } = useField<string>("lastname");
const { value: password, handleBlur: passwordBlur } = useField<string>("password");
const { value: passwordConfirm, handleBlur: passwordConfirmBlur } = useField<string>("passwordConfirm");

/**
 * call the profile api to get all existing profiles
 */
const getProfilesList = useDebounceFn(async(): Promise<InterfaceProfile[]> => {
    const { response }: UsersActionsProfile = await Api.Get({ route: "profile" });
    if (response && response.status === 200) {
        return response.data;
    } else return [];
}, 250);

const onGetAllActivities = async() => {
    const { response }: InterfaceResponseActivities = await Api.Get({ route: "activity" });
    if (response && response.status === 200) {
        return response.data.filter((item) => item.is_active);
    } else return [];
};

const onSubmit = handleSubmit(async(values) => {
    delete values.password;
    delete values.passwordConfirm;
    const isUpdate = !!props.formData?.id;
    const url = isUpdate ? `user/${ props.formData?.id }` : "user";
    const method = isUpdate ? Api.Put : Api.Post;

    const { response }: UsersActiosMembersActions = await method({ route: url, data: { ...values } });
    if (response && [ 200, 201 ].includes(response.status)) {
        useGlobalToast({ life: 5000, summary: `${ response.data.names } actualizado`, severity: "success" });
        reloadData();
    }
}, ({ errors }) => castFormErrors(errors));

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
    activityOptions.value = await onGetAllActivities();

    // Check if the form has an existing ID (editing mode)
    if (props.formData?.id) {
        setValues({ ...props.formData }, false);

        const keys = refPermissions.value.flattenPermissionsTree(permissions.value);
        refPermissions.value.keysSelected = refPermissions.value.updateSelectionKeys(keys);
    }
});

provide("permissions", { permissions, handleBlurPermissions, checkAll });

</script>

<template>
    <Tabs value="info">
        <TabList>
            <Tab value="info">Datos del usuario</Tab>
            <Tab value="permissions">Permisos</Tab>
        </TabList>
        <TabPanels class="m-0 !px-0 pb-0">
            <TabPanel value="info" class="align-items-form">
                <ValidateFormItem label="Nombres" mark span="6" name="names" v-slot="{ error }">
                    <InputText v-model="names" id="names" :invalid="!!error" fluid @blur="namesBlur($event, true)" autocomplete="off"/>
                </ValidateFormItem>
                <ValidateFormItem label="Apellidos" span="6">
                    <InputText v-model="lastname" id="lastname" fluid autocomplete="off"/>
                </ValidateFormItem>
                <ValidateFormItem label="Correo" span="5">
                    <InputText v-model="email" id="email" fluid autocomplete="off"/>
                </ValidateFormItem>
                <ValidateFormItem label="Perfil" span="4" mark name="profile" v-slot="{ error }">
                    <Select v-model="profile" label-id="profile" :invalid="!!error" :options="profileOptions" name="profile" fluid
                            optionLabel="description" optionValue="id" @blur="profileBlur($event, true)" show-clear/>
                </ValidateFormItem>
                <ValidateFormItem label="Actividad" span="3" mark name="activity" v-slot="{ error }">
                    <Select v-model="activity" label-id="activity" :invalid="!!error" :options="activityOptions" name="activity" fluid
                            optionLabel="description" optionValue="id" @blur="activityBlur($event, true)" show-clear/>
                </ValidateFormItem>
                <ValidateFormItem v-if="!props.formData?.id" label="Usuario" mark span="4" name="username" v-slot="{ error }">
                    <InputText v-model="username" id="username" :invalid="!!error" fluid @blur="usernameBlur($event, true)"
                               max="11" autocomplete="off"/>
                </ValidateFormItem>
                <ValidateFormItem v-if="!props.formData?.id" label="Contraseña" mark span="4" name="password" v-slot="{ error }">
                    <Password v-model="password" input-id="password" :invalid="!!error" class="w-full" :toggleMask="true"
                              :feedback="false" @blur="passwordBlur($event, true)" input-class="w-full !py-1.5"/>
                </ValidateFormItem>
                <ValidateFormItem v-if="!props.formData?.id" label="Confirmar" mark span="4" name="passwordConfirm" v-slot="{ error }">
                    <Password v-model="passwordConfirm" input-id="confirm" :invalid="!!error" class="w-full" :toggleMask="true"
                              :feedback="false" @blur="passwordConfirmBlur($event, true)" input-class="w-full !py-1.5"/>
                </ValidateFormItem>
            </TabPanel>
            <TabPanel value="permissions">
                <PermissionsManager ref="refPermissions"/>

            </TabPanel>
        </TabPanels>
    </Tabs>
    <div class="align-buttons-submit space-x-2">
        <Button label="Cancelar" severity="secondary" raised fluid class="border border-surface-300" @click="reloadData" #icon>
            <i-material-symbols-block-outline class="mx-1"/>
        </Button>
        <Button :label="`${!props.formData?.id ? 'Crear' : 'Editar'} Usuario`" fluid @click="onSubmit()" #icon>
            <i-material-symbols-person-add-outline-rounded class="mx-1"/>
        </Button>
    </div>
</template>
