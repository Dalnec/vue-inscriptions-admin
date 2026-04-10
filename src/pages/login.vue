<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import { computed, ref } from "vue";
import { useField, useForm } from "vee-validate";
import type { InterfaceUserLoginActions } from "@/types/InterfaceLogin.ts";
import * as yup from "yup";
import { useRoute, useRouter } from "vue-router";
import { useUserConsoleStore } from "@/stores/loginStore/storeUserDataConsole.ts";

const useLoginStore = useUserDataConfigStore();
const useLoginConsoleStore = useUserConsoleStore();
const refPassword = ref();
const loading = ref(false);
const route = useRoute();
const router = useRouter();

const isConsole = computed(() => route.path.startsWith("/console"));
const slug = computed(() => route.params.slug as string | undefined);

const schemaValidate = yup.object({
    password: yup.string().required("Ingrese su contraseña").label("password").min(5, "Ingresa al menos 5 caracteres"),
    username: yup.string().required("Ingrese su usuario").label("username").min(5, "Ingresa al menos 5 caracteres")
});

const { handleSubmit, values } = useForm<{ password: string; username: string; }>({ validationSchema: schemaValidate });
const { value: username } = useField<string>("username");
const { value: password } = useField<string>("password");

const onLogin = handleSubmit(async(values) => {
    try {
        loading.value = true;
        const { response }: InterfaceUserLoginActions = await Api.Post({
            route: "login",
            data: {
                ...values,
                shortname: isConsole.value ? undefined : slug.value
            }
        });

        if (response.status !== 200) return;

        if (isConsole.value) {
            await useLoginConsoleStore.loginUserData(response.data);
            await router.replace("/console-dashboard");
        } else {
            await useLoginStore.loginUserData(response.data);
            await router.replace(`/${ slug.value }/home`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

const focusPassword = () => {
    if (values.password.trim()) onLogin();
    else refPassword.value.$el.querySelector("input").focus();
};

</script>

<template>
    <div class="fixed top-2 right-2 z-50">
        <app-config/>
    </div>
    <div class="flex min-h-screen items-center justify-center p-2 bg-primary-100 dark:bg-slate-900">
        <div class="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-4 shadow-lg dark:border-slate-600 dark:bg-gray-800 sm:p-6">

            <h2 class="text-center text-3xl font-bold text-gray-800 dark:text-white">Iniciar sesión</h2>
            <p class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales</p>

            <div class="mt-6 space-y-2" v-focustrap>
                <ValidateFormItem name="username" label="Usuario" mark v-slot="{ error }">
                    <InputText v-model="username" fluid placeholder="Ingrese su usuario" id="username" autofocus
                               @update:model-value="(value: string | undefined) => username = value?.toUpperCase() || ''"
                               :invalid="!!error" @keyup.enter="focusPassword"/>
                </ValidateFormItem>

                <ValidateFormItem name="password" label="Contraseña" mark v-slot="{ error }">
                    <Password inputClass="w-full" :feedback="false" v-model="password" id="password" class="w-full" ref="refPassword"
                              :invalid="!!error" toggleMask @keyup.enter="onLogin()" placeholder="********"/>
                </ValidateFormItem>
                <Button label="Iniciar Sesión" fluid :loading @click="onLogin"
                        :pt="{ loadingIcon: { class: 'absolute right-2 order-1 h-7 w-7' } }" #icon>
                    <i-material-symbols-login-rounded class="absolute right-2 order-1 h-7 w-7"/>
                </Button>
            </div>
        </div>
    </div>
</template>
