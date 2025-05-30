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

import FormItem from "@/components/formItem.vue";
import { onMounted, ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { Api } from "@/api/connection";
import { useToast } from "primevue";

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
    /**
     * Define a route to send data to put requests
     */
    routeUpdate?: string;
}

// Define component props using the PropsDataGeneric interface
const props = defineProps<PropsDataGeneric>();
// Reactive object containing the initial form values.
const fields = ref({ description: "", active: true });
//Toast notification instance.
const toast = useToast();

/**
 * Validation schema using Yup.
 * - description: must be a non-empty trimmed string.
 * - status: must be a boolean value.
 */
const schemaValidate = yup.object({
    description: yup.string().trim().required("Ingrese una descripción").label("Desc.")
});

// Create the form instance with initial values and the validation schema.
const { handleSubmit, errors, setValues } = useForm({ validationSchema: schemaValidate, initialValues: fields.value });

// Define the form fields using vee-validate.
const { value: description, handleBlur: descriptionHandleBlur } = useField<string>("description");

/**
 * Submits the form to update the user's description.
 * On success, displays a success toast and closes the form;
 * on failure, displays an error toast.
 */
const saveChangesForm = handleSubmit(async(values) => {
        try {
            if (props.formData?.id) {
                const { response } = await Api.Put({
                    route: `${ props.route }/${ props.formData?.id }${ props.routeUpdate ? props.routeUpdate + "/" : "" }`, data: { ...values }
                });
                if (response && response.status === 200) {
                    toast.add({ severity: "success", life: 5000, summary: "Datos actualizados correctamente" });
                    props.onCloseForm();
                    await props.reloadData();
                }
            } else {
                const { response } = await Api.Post({ route: `${ props.route }`, data: { ...values } });
                if (response && response.status === 201) {
                    toast.add({ severity: "success", life: 5000, summary: "Datos agregados correctamente" });
                    props.onCloseForm();
                    await props.reloadData();
                }
            }
        } catch (error) {
            toast.add({ severity: "error", life: 7000, summary: `Error: ${ error }` });
            console.log(error);
        }
    },
    // Error handler for validation failures
    ({ errors }) => {
        const errorMessages: string = Object.entries(errors).map(([ field, message ]) => `${ field }: ${ message }`).join(", ");
        toast.add({ severity: "error", summary: "Error", detail: `Complete los siguientes campos:\n ${ errorMessages }`, life: 10000 });
    }
);

onMounted(() => {
    if (props.formData?.id) setValues(props.formData || {});
});

</script>

<template>
    <div class="align-items-form">
        <form-item mark cols="12" label="Description" :error="errors.description">
            <InputText v-model="description" fluid @blur="descriptionHandleBlur($event, true)" input-id="description"
                       :invalid="!!errors.description" class="w-full"/>
        </form-item>
    </div>
    <div class="align-buttons-submit">
        <Button severity="secondary" raised fluid label="Cancelar" @click="props.onCloseForm()"/>
        <Button raised fluid @click="saveChangesForm">
            <template #default>
                {{ props.formData?.id ? "Editar" : "Crear" }}
            </template>
        </Button>
    </div>
</template>
