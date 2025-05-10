<script setup lang="ts">
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { ref } from "vue";
import { useToast } from "primevue";
import { Api } from "@/api/connection.ts";
import { type InterfaceUserLoginActions } from "@/stores/loginStore/InterfaceLogin";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData";

interface Fields {
    password: string;
    username: string;
}

const { loginUserData } = useUserDataConfigStore();
const fields = ref<Fields>({ username: "", password: "" });
const toast = useToast();
const refPassword = ref();

const schemaValidate = yup.object({
    password: yup.string().required("Ingrese su contraseña").label("password").min(5, "Ingresa al menos 5 caracteres"),
    username: yup.string().required("Ingrese su usuario").label("username").min(5, "Ingresa al menos 5 caracteres")
});

const { handleSubmit, errors } = useForm<Fields>({ initialValues: fields.value, validationSchema: schemaValidate });
const { value: username, errorMessage: usernameError, handleBlur: usernameBlur } = useField<string>("username");
const { value: password, errorMessage: passwordError, handleBlur: passwordBlur } = useField<string>("password");

const onSubmit = handleSubmit(async(values: Fields) => {
    const { response }: InterfaceUserLoginActions = await Api.Post({ route: "login", data: { ...values } });
    if (response.status === 200) {
        await loginUserData(response.data);
        // configureAxiosInterceptors()
    }
}, ({ errors }) => {
    const errorMessages: string = Object?.["entries"](errors).map(([ field, message ]) => `${ field }: ${ message }`).join(", ");
    toast.add({ severity: "error", summary: "Error", detail: `Complete los siguientes campos: ${ errorMessages }`, life: 10000 });
});

const focusPassword = () => refPassword.value.$el.querySelector("input").focus();

</script>

<template>
    <div class="fixed top-2 right-2 z-50">
        <app-config/>
    </div>
    <div class="flex min-h-screen items-center justify-center p-2 bg-primary-100 dark:bg-slate-900">
        <div class="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-4 shadow-lg dark:border-slate-600 dark:bg-gray-800 sm:p-6">
            <!--            <div class="mb-4 flex justify-center">-->
            <!--                <img src="@/assets/img/businessLogo.png" alt="Business Logo" class="h-16 w-auto object-contain sm:h-20 md:h-24 lg:h-28"/>-->
            <!--            </div>-->

            <h2 class="text-center text-3xl font-bold text-gray-800 dark:text-white">Iniciar sesión</h2>
            <p class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales</p>

            <div class="mt-6 space-y-2" v-focustrap>

                <form-item for-label="username" label="Usuario" mark :error="usernameError">
                    <InputText v-model="username" fluid placeholder="Ingrese su usuario" id="username" autofocus
                               @update:model-value="(value: string | undefined) => username = value?.toUpperCase() || ''"
                               @blur="usernameBlur($event, true)" :invalid="!!errors.username" @keyup.enter="focusPassword"/>
                </form-item>

                <form-item for-label="password" label="Contraseña" mark :error="passwordError">
                    <Password inputClass="w-full" :feedback="false" v-model="password" id="password" class="w-full" ref="refPassword"
                              :invalid="!!errors.password" @blur="passwordBlur($event,true)" toggleMask @keyup.enter="onSubmit()"
                              placeholder="********"/>
                </form-item>

                <Button label="Ingresar" @click="onSubmit()" class="mt-4 w-full">
                    <span>Iniciar Sesión </span>
                    <i-noto-turtle class="absolute right-2 order-1 h-7 w-7"/>
                </Button>

            </div>
        </div>
    </div>
</template>
