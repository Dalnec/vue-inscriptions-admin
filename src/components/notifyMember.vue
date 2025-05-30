<script setup lang="ts">

import type { InscriptionsMembers } from "@/modules/inscriptions/inscriptionsMembers.ts";
import { Api } from "@/api/connection.ts";
import { ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import toastEvent from "@/composables/toastEvent.ts";

const props = defineProps<{ member: InscriptionsMembers, closeModal: () => boolean }>();
// const itemsEmail = ref<string[]>([]);

// const search = (event: AutoCompleteCompleteEvent) => {
//     itemsEmail.value = [ "@gmail.com", "@hotmail.com", "@outlook.com" ].map((item) => event.query + item);
// };

const schemaValidate = yup.object({
    email: yup.string().email("Agregue un correo valido").required("Ingrese un correo").label("email")
});

const { handleSubmit, errors } = useForm({ initialValues: { email: "" }, validationSchema: schemaValidate });
const { value: email } = useField<string>("email");

const onSendMail = handleSubmit(async(values) => {
    const { response } = await Api.Post({ route: `inscription/${ props.member.id }/send-email`, data: { email: values.email } });
    if (response && response.status === 200) {
        console.log(response);
    }
}, ({ values }) => {
    console.log(values);
    toastEvent({ summary: "Agregue el correo" });
});

</script>

<template>
    <div class="align-items-form">
        <FormItem class="12" label="Correo a enviar" :error="errors.email" mark for-label="email">
            <!--            <AutoComplete v-model="email" @complete="search" :suggestions="itemsEmail" :typeahead="true" multiple fluid />-->
            <InputText v-model="email" fluid :invalid="!!errors.email" id="email"/>
        </FormItem>
        <FormItem class="12" hide-error hide-label>
            <Button fluid label="Enviar Correo" @click="onSendMail"/>
        </FormItem>
        <FormItem class="12" label="Numero a enviar" hide-error>
            <Textarea fluid value="Temporalmente inactivo..." disabled/>
        </FormItem>
        <FormItem class="12" hide-error hide-label>
            <Button fluid label="Enviar a WhatsApp" disabled/>
        </FormItem>
    </div>
</template>
