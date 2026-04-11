<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { useUserDataConfigStore } from "@/stores/loginStore/storeUserData";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import { computed, onMounted, ref } from "vue";
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

// Información del evento
const eventInfo = ref<{ title: string; logo: string; shortname: string } | null>(null);
const loadingEvent = ref(false);

const fetchEventInfo = async() => {
    if (isConsole.value || !slug.value) return;
    try {
        loadingEvent.value = true;
        const { response } = await Api.Get({ route: "activity", params: { shortname: slug.value } });
        if (response?.status === 200 && response.data?.length > 0) {
            const ev = response.data[0];
            eventInfo.value = { title: ev.title, logo: ev.logo, shortname: ev.shortname };
        }
    } catch (e) {
        console.error("Error al obtener info del evento:", e);
    } finally {
        loadingEvent.value = false;
    }
};

onMounted(fetchEventInfo);

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
            await router.replace("home/dashboard");
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
    <div class="fixed top-3 right-3 z-50">
        <app-config/>
    </div>

    <div class="login-wrapper">
        <!-- Decoración de fondo -->
        <div class="login-bg-decoration"/>

        <div class="login-card">
            <!-- Encabezado contextual -->
            <div class="login-header">
                <!-- Evento: logo + nombre -->
                <template v-if="!isConsole && slug">
                    <Skeleton v-if="loadingEvent" shape="circle" width="4rem" height="4rem"/>
                    <div v-else-if="eventInfo?.logo" class="login-event-logo">
                        <img :src="eventInfo.logo" :alt="eventInfo.title" class="h-16 w-16 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-700"/>
                    </div>
                    <div v-else class="login-event-icon">
                        <i-material-symbols-calendar-month class="h-8 w-8 text-primary-500"/>
                    </div>

                    <Skeleton v-if="loadingEvent" width="10rem" height="1.5rem" class="mt-2"/>
                    <h2 v-else class="login-title">{{ eventInfo?.title || slug }}</h2>
                    <Tag v-if="eventInfo?.shortname && !loadingEvent" :value="eventInfo.shortname" severity="secondary" class="mt-1"/>
                </template>

                <!-- Console: ícono admin -->
                <template v-else>
                    <div class="login-console-icon">
                        <i-material-symbols-action-key-outline class="h-8 w-8 text-primary-500"/>
                    </div>
                    <h2 class="login-title">Panel Administrativo</h2>
                </template>

                <p class="login-subtitle">Ingresa tus credenciales para continuar</p>
            </div>

            <Divider/>

            <!-- Formulario -->
            <div class="login-form" v-focustrap>
                <ValidateFormItem name="username" label="Usuario" mark v-slot="{ error }">
                    <InputText v-model="username" fluid placeholder="Ingrese su usuario" id="username" autofocus
                               @update:model-value="(value: string | undefined) => username = value?.toUpperCase() || ''"
                               :invalid="!!error" @keyup.enter="focusPassword"/>
                </ValidateFormItem>

                <ValidateFormItem name="password" label="Contraseña" mark v-slot="{ error }">
                    <Password inputClass="w-full" :feedback="false" v-model="password" id="password" class="w-full" ref="refPassword"
                              :invalid="!!error" toggleMask @keyup.enter="onLogin()" placeholder="********"/>
                </ValidateFormItem>

                <Button label="Iniciar Sesión" fluid :loading @click="onLogin" class="mt-2"
                        :pt="{ loadingIcon: { class: 'absolute right-3 order-1 h-6 w-6' } }" #icon>
                    <i-material-symbols-login-rounded class="absolute right-3 order-1 h-6 w-6"/>
                </Button>
            </div>

            <!-- Footer -->
            <p class="login-footer">
                <i-material-symbols-lock class="h-3.5 w-3.5"/>
                Conexión segura
            </p>
        </div>
    </div>
</template>

<style scoped>
.login-wrapper {
    @apply relative flex min-h-screen items-center justify-center p-4 overflow-hidden
    bg-gradient-to-br from-primary-50 via-white to-primary-100
    dark:from-slate-950 dark:via-slate-900 dark:to-slate-950;
}

.login-bg-decoration {
    @apply pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20
    bg-primary-300 blur-3xl dark:bg-primary-800;
}

.login-bg-decoration::after {
    content: "";
    @apply absolute -bottom-48 -left-48 h-80 w-80 rounded-full opacity-15
    bg-primary-400 blur-3xl dark:bg-primary-700;
}

.login-card {
    @apply relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8
    bg-white/80 backdrop-blur-md border border-surface-200
    shadow-xl shadow-primary-100/30
    dark:bg-slate-800/80 dark:border-slate-700 dark:shadow-slate-900/40;
}

.login-header {
    @apply flex flex-col items-center text-center;
}

.login-event-logo {
    @apply flex items-center justify-center;
}

.login-event-icon,
.login-console-icon {
    @apply flex items-center justify-center h-16 w-16 rounded-full
    bg-primary-50 dark:bg-primary-900/40;
}

.login-title {
    @apply mt-3 text-2xl font-bold text-gray-800 dark:text-white leading-tight;
}

.login-subtitle {
    @apply mt-2 text-sm text-gray-500 dark:text-gray-400;
}

.login-form {
    @apply space-y-3;
}

.login-footer {
    @apply mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 select-none;
}
</style>

