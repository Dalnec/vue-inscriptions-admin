<script setup lang="ts">
/**
 * @fileoverview
 * This component provides a form to update a user's password (description) and status.
 * It uses vee-validate for form validation and PrimeVue for UI components.
 *
 * Props:
 * - dataID: The ID of the user to update.
 * - closeForm: A function to close the form.
 */

import { Api } from "@/api/connection";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import { useField, useForm } from "vee-validate";
import { onMounted, ref } from "vue";
import useGlobalToast from "@/composables/toastEvent.ts";
import * as yup from "yup";

// Define the interface for the component props
export interface PropsDataGeneric {
    /**
     * The ID of the user to be updated.
     */
    dataID?: number | string;
    /**
     * Define an object with initial values to add to the form
     */
    formData?: { description: string, active: boolean, id: number };
    /**
     * Function to close the form.
     */
    onCloseForm: () => void;
    /**
     * Function to reload data from an endpoint
     */
    reloadData: () => Promise<void>;
    /**
     * Define a route to send data to post or put requests
     */
    route: string;
    showActive?: boolean;
    /**
     * Define a route to send data to put requests
     */
    routeUpdate?: string;
}

// Define component props using the PropsDataGeneric interface
const props = defineProps<PropsDataGeneric>();
// Reactive object containing the initial form values.
const fields = ref({ description: "", active: true });

/**
 * Validation schema using Yup.
 * - description: must be a non-empty trimmed string.
 * - status: there must be a boolean value.
 */
const schemaValidate = yup.object({
    description: yup.string().trim().required("Ingrese una descripción").label("Desc.")
});

// Create the form instance with initial values and the validation schema.
const { handleSubmit, setValues } = useForm({ validationSchema: schemaValidate, initialValues: fields.value });

// Define the form fields using vee-validate.
const { value: description } = useField<string>("description");
const { value: active } = useField<string>("active");

/**
 * Submits the form to update the user's description.
 * On success, displays a success toast and closes the form;
 * on failure, displays an error toast.
 */
const saveChangesForm = handleSubmit(async(values) => {
    try {
        const isUpdate = props.formData?.id;
        const route = isUpdate ? `${ props.route }/${ props.formData?.id }${ props.routeUpdate ? props.routeUpdate + "/" : "" }` : `${ props.route }`;
        const method = isUpdate ? Api.Put : Api.Post;

        const { response } = await method({ route, data: { ...values } });
        if (response && [ 200, 201 ].includes(response.status)) {
            useGlobalToast({ life: 5000, severity: "success", summary: "Datos actualizados correctamente" });
            props.onCloseForm();
            await props.reloadData();
        }
    } catch (error) {
        useGlobalToast({ life: 7000, severity: "error", summary: `Error: ${ error }` });
        console.log(error);
    }
}, ({ errors }) => castFormErrors(errors));

onMounted(() => {
    if (props.formData?.id) setValues(props.formData || {});
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="12" label="Description" v-slot="{ error }" for-label="description">
            <InputText v-model="description" fluid input-id="description" :invalid="!!error"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="3" label="Activo" name="active" v-if="props.showActive">
            <ToggleSwitch v-model="active" fluid input-id="active"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button severity="secondary" raised fluid label="Cancelar" @click="props.onCloseForm()"/>
        <Button :label="props.formData?.id ? 'Editar' : 'Crear'" raised fluid @click="saveChangesForm"/>
    </div>
</template>
