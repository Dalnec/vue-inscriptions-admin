<script setup lang="ts">
import { ref, onMounted, computed, h } from "vue";
import { useRoute } from "vue-router";
import { Api } from "@/api/connection.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { useModal } from "@/composables/useModal.ts";
import BirthdayListModal from "@/modules/dashboard/BirthdayListModal.vue";
import type { DashboardData } from "@/modules/dashboard/Dashboard.ts";

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<DashboardData | null>(null);

const statusColor: Record<string, string> = {
	PENDIENTE: "warning",
	CONFIRMADO: "success",
	RECHAZADO: "danger",
	ERROR: "secondary"
};

const statusIcon: Record<string, string> = {
	PENDIENTE: "i-ic-round-schedule",
	CONFIRMADO: "i-ic-round-check-circle",
	RECHAZADO: "i-ic-round-cancel",
	ERROR: "i-ic-round-error"
};

const totalByStatus = computed(() => {
	if ( !data.value) return [];
	return Object.entries(data.value.inscriptions.by_status).map(([ status, count ]) => ({
		status, count, color: statusColor[status] || "info", icon: statusIcon[status] || ""
	}));
});

const profileLabels: Record<string, string> = {
	ADMINISTRADOR: "Admin",
	INSCRIPCIONES: "Inscripciones",
	CAJA: "Caja"
};

const churchPage = ref(1);
const churchRows = 10;

const paginatedChurches = computed(() => {
	if (!data.value) return [];
	const start = (churchPage.value - 1) * churchRows;
	return data.value.churches_ranking.slice(start, start + churchRows);
});

const totalChurchPages = computed(() => {
	if (!data.value) return 0;
	return Math.ceil(data.value.churches_ranking.length / churchRows);
});

const kindColors = [
	"from-violet-500 to-purple-600",
	"from-blue-500 to-indigo-600",
	"from-emerald-500 to-teal-600",
	"from-amber-500 to-orange-600"
];

const { openModal } = useModal();

function onBirthdayClick() {
	if ( !data.value?.birthdays.people.length) return;
	openModal({
		component: h(BirthdayListModal, {
			people: data.value.birthdays.people
		}),
		header: `Cumpleañeros durante el evento (${ data.value.birthdays.count })`,
		width: "40vw"
	});
}

onMounted(async() => {
	const slug = route.params.slug as string;
	if ( !slug) {
		error.value = "No se encontró el evento";
		loading.value = false;
		return;
	}

	try {
		const { response: actRes } = await Api.Get({ route: "activity", params: { shortname: slug } });
		if ( !actRes?.data?.[0]?.id) {
			error.value = "Evento no encontrado";
			loading.value = false;
			return;
		}

		const activityId = actRes.data[0].id;
		const { response: dashRes } = await Api.Get({ route: `activities/${ activityId }/dashboard` });
		if (dashRes?.data) {
			data.value = dashRes.data;
		} else {
			error.value = "No se pudo cargar el dashboard";
		}
	} catch (e) {
		error.value = "Error al cargar el dashboard";
		useGlobalToast({ severity: "error", summary: "Error", detail: error.value ?? "" });
	} finally {
		loading.value = false;
	}
});

function formatCurrency(val: string | number): string {
	const num = typeof val === "string" ? parseFloat(val) : val;
	return num.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(val: number): string {
	return (val * 100).toFixed(1) + "%";
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("es-PE", {
		day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
	});
}

</script>

<template>
	<div class="min-h-screen">
		<!-- Loading -->
		<div v-if="loading" class="flex items-center justify-center py-32">
			<i class="i-ic-round-loop text-4xl text-cyan-500 animate-spin"></i>
		</div>

		<!-- Error -->
		<div v-else-if="error" class="flex flex-col items-center justify-center py-32 gap-4">
			<i class="i-ic-round-error-outline text-6xl text-red-400"></i>
			<p class="text-lg text-gray-500 dark:text-gray-400">{{ error }}</p>
		</div>

		<!-- Dashboard content -->
		<template v-else-if="data">
			<!-- Event Header -->
			<div
				class="relative overflow-hidden rounded-2xl mb-6 shadow-lg border-2 border-emerald-400/30 dark:border-emerald-600/30
                       bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500
                       dark:from-emerald-800 dark:via-teal-700 dark:to-cyan-800">
				<div class="absolute inset-0 opacity-10">
					<div class="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white"></div>
					<div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white"></div>
				</div>
				<div class="relative px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div class="text-white">
						<div class="flex items-center gap-2 flex-wrap">
							<h1 class="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">{{ data.activity.title }}</h1>
							<span v-if="data.activity.shortname"
							      class="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">{{ data.activity.shortname }}</span>
						</div>
						<p class="text-sm text-white/90 mt-1 flex items-center gap-1.5 drop-shadow-sm">
							<i class="i-ic-round-calendar-today text-sm"></i>
							{{ formatDate(data.activity.start_date) }} — {{ formatDate(data.activity.end_date) }}
						</p>
					</div>
					<div class="flex items-center gap-2">
						<span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm"
						      :class="data.activity.is_active
                                ? 'bg-emerald-400/30 text-emerald-50 border border-emerald-300/40'
                                : 'bg-gray-500/30 text-gray-200 border border-gray-400/30'">
							{{ data.activity.is_active ? (data.activity.is_ended ? "Finalizado" : "Activo") : "Inactivo" }}
						</span>
						<span v-if="data.activity.settings?.inscription?.send_email"
						      class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/30 text-blue-50 border border-blue-300/40 flex items-center gap-1 backdrop-blur-sm">
							<i class="i-ic-round-email text-xs"></i> Email
						</span>
					</div>
				</div>
			</div>

			<!-- KPI Cards -->
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-600 flex flex-col
				            border-t-4 border-t-gray-400 dark:border-t-gray-500">
					<span class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</span>
					<span class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ data.inscriptions.total }}</span>
					<span class="text-xs text-gray-400 dark:text-gray-400">inscripciones</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-600 flex flex-col
				            border-t-4 border-t-emerald-500">
					<span class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Confirmados</span>
					<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">{{
							data.inscriptions.by_status.CONFIRMADO || 0
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-400">inscripciones</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-600 flex flex-col
				            border-t-4 border-t-sky-500">
					<span class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asistencia</span>
					<span class="text-2xl font-bold text-sky-600 dark:text-sky-300 mt-1">{{ data.inscriptions.attended_count }}</span>
					<span class="text-xs text-gray-400 dark:text-gray-400">{{ formatPercent(data.inscriptions.attendance_rate) }}</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-600 flex flex-col
				            border-t-4 border-t-amber-500">
					<span class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pendientes</span>
					<span class="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-1">{{
							data.inscriptions.by_status.PENDIENTE || 0
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-400">por confirmar</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-600 flex flex-col
				            border-t-4 border-t-violet-500">
					<span class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Esperado</span>
					<span class="text-2xl font-bold text-violet-600 dark:text-violet-300 mt-1">S/{{
							formatCurrency(data.financial.total_expected)
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-400">ingreso total</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-600 flex flex-col
				            border-t-4 border-t-emerald-500">
					<span class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contabilizado</span>
					<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">S/{{
							formatCurrency(data.financial.total_posted)
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-400">ingresos reales</span>
				</div>
			</div>

			<!-- Main grid: inscriptions by kind + financial summary -->
			<div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
				<!-- Inscriptions by kind -->
				<div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600">
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-group text-cyan-500"></i>
						Inscripciones por tipo
					</h3>
					<div class="space-y-3">
						<div v-for="(kind, idx) in data.inscriptions.by_kind" :key="kind.kind_id ?? idx"
						     class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600">
							<div class="w-1.5 h-12 rounded-full"
							     :class="kindColors[idx % kindColors.length]"></div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<span class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ kind.kind }}</span>
									<span class="text-sm font-bold text-gray-900 dark:text-white">{{ kind.count }}</span>
								</div>
								<div class="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-300">
									<span class="flex items-center gap-1">
										<i class="i-ic-round-check-circle text-emerald-500 text-xs"></i>
										{{ kind.confirmed }} conf.
									</span>
									<span class="flex items-center gap-1">
										<i class="i-ic-round-how-to-reg text-sky-500 text-xs"></i>
										{{ kind.attended }} asis.
									</span>
								</div>
								<div class="mt-1.5 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
									<div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
									     :style="{ width: kind.count > 0 ? (kind.confirmed / kind.count * 100) + '%' : '0%' }"></div>
								</div>
							</div>
						</div>
						<div v-if="!data.inscriptions.by_kind.length" class="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
							Sin datos de inscripciones por tipo
						</div>
					</div>
				</div>

				<!-- Financial Summary -->
				<div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600">
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-account-balance-wallet text-cyan-500"></i>
						Resumen financiero
					</h3>
					<div class="space-y-3">
						<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600">
							<span class="text-xs font-medium text-gray-600 dark:text-gray-300">Esperado</span>
							<span class="text-sm font-bold text-gray-900 dark:text-white">S/ {{ formatCurrency(data.financial.total_expected) }}</span>
						</div>
						<div class="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
							<span class="text-xs font-medium text-emerald-700 dark:text-emerald-300">Confirmado</span>
							<span class="text-sm font-bold text-emerald-700 dark:text-emerald-300">S/ {{ formatCurrency(data.financial.total_confirmed) }}</span>
						</div>
						<div class="flex items-center justify-between p-3 rounded-lg bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800">
							<span class="text-xs font-medium text-sky-700 dark:text-sky-300">Contabilizado</span>
							<span class="text-sm font-bold text-sky-700 dark:text-sky-300">S/ {{ formatCurrency(data.financial.total_posted) }}</span>
						</div>
						<div class="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700">
							<span class="text-xs font-bold text-amber-800 dark:text-amber-300">Por cobrar</span>
							<span class="text-sm font-bold text-amber-800 dark:text-amber-300">S/ {{ formatCurrency(data.financial.pending_amount) }}</span>
						</div>
					</div>

					<hr class="my-4 border-gray-200 dark:border-gray-600">

					<!-- Payment methods -->
					<h4 class="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-3">Por método de pago</h4>
					<div class="space-y-2">
						<div v-for="pm in data.financial.by_payment_method" :key="pm.payment_method_id"
						     class="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
							<span class="font-medium text-gray-700 dark:text-gray-200">{{ pm.description }}</span>
							<span class="font-bold text-gray-900 dark:text-white">S/ {{ formatCurrency(pm.total_amount) }}</span>
						</div>
						<div v-if="!data.financial.by_payment_method.length"
						     class="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
							Sin movimientos registrados
						</div>
					</div>

					<!-- Cash balance -->
					<hr class="my-4 border-gray-200 dark:border-gray-600">
					<h4 class="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-3">Balance de caja</h4>
					<div class="grid grid-cols-2 gap-2">
						<div class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-center">
							<span class="text-xs font-medium text-emerald-700 dark:text-emerald-300 block">Ingresos</span>
							<span class="text-sm font-bold text-emerald-800 dark:text-emerald-200">S/ {{ formatCurrency(data.financial.cash_balance.total_incomes) }}</span>
						</div>
						<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-center">
							<span class="text-xs font-medium text-red-700 dark:text-red-300 block">Egresos</span>
							<span class="text-sm font-bold text-red-800 dark:text-red-200">S/ {{ formatCurrency(data.financial.cash_balance.total_expenses) }}</span>
						</div>
						<div class="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 text-center col-span-2">
							<span class="text-xs font-medium text-cyan-700 dark:text-cyan-300 block">Total en caja</span>
							<span class="text-base font-bold text-cyan-800 dark:text-cyan-200">S/ {{ formatCurrency(data.financial.cash_balance.cash_total) }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Gender distribution + Churches ranking -->
			<div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
				<!-- Gender -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600">
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-wc text-cyan-500"></i>
						Genero
					</h3>
					<div class="space-y-4">
						<div v-for="(count, gender) in data.inscriptions.by_gender" :key="gender"
						     class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-sm"
							     :class="gender === 'FEMENINO'
                                    ? 'bg-pink-200 dark:bg-pink-800/60 text-pink-700 dark:text-pink-200 border-2 border-pink-300 dark:border-pink-600'
                                    : 'bg-blue-200 dark:bg-blue-800/60 text-blue-700 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600'">
								{{ gender === "FEMENINO" ? "F" : "M" }}
							</div>
							<div class="flex-1">
								<div class="flex justify-between text-sm">
									<span class="font-semibold text-gray-700 dark:text-gray-200 capitalize">{{ gender.toLowerCase() }}</span>
									<span class="font-bold text-gray-900 dark:text-white">{{ count }}</span>
								</div>
								<div class="mt-1.5 h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
									<div class="h-full rounded-full transition-all"
									     :class="gender === 'FEMENINO'
                                            ? 'bg-gradient-to-r from-pink-400 to-rose-500'
                                            : 'bg-gradient-to-r from-blue-400 to-indigo-500'"
									     :style="{ width: (count / (data.inscriptions.total || 1) * 100) + '%' }">
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Churches Ranking -->
				<div class="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600">
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-church text-cyan-500"></i>
						Ranking de iglesias
					</h3>
					<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
						<table class="w-full text-sm">
							<thead>
							<tr class="text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/70">
								<th class="p-3 font-medium">#</th>
								<th class="p-3 font-medium">Iglesia</th>
								<th class="p-3 font-medium text-right">Inscritos</th>
								<th class="p-3 font-medium text-right">Confirmados</th>
								<th class="p-3 font-medium text-right">Asistencia</th>
								<th class="p-3 font-medium text-right">Total</th>
								<th class="p-3 font-medium text-right">Confirmado</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="(church, idx) in paginatedChurches" :key="church.church_id ?? idx"
							    class="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
								<td class="p-3 text-gray-400 dark:text-gray-500 text-xs font-mono font-bold">{{ (churchPage - 1) * churchRows + idx + 1 }}</td>
								<td class="p-3 font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">{{ church.church_name }}</td>
								<td class="p-3 text-right font-bold text-gray-900 dark:text-white">{{ church.total_inscriptions }}</td>
								<td class="p-3 text-right font-bold text-emerald-600 dark:text-emerald-300">{{ church.confirmed }}</td>
								<td class="p-3 text-right font-bold text-sky-600 dark:text-sky-300">{{ church.attended }}</td>
								<td class="p-3 text-right font-semibold text-gray-700 dark:text-gray-200">S/ {{ formatCurrency(church.total_amount) }}</td>
								<td class="p-3 text-right font-bold text-emerald-600 dark:text-emerald-300">S/ {{ formatCurrency(church.confirmed_amount) }}</td>
							</tr>
							<tr v-if="!data.churches_ranking.length">
								<td colspan="7" class="p-6 text-center text-sm text-gray-400 dark:text-gray-500">Sin iglesias registradas</td>
							</tr>
							</tbody>
						</table>

						<!-- Pagination -->
						<div v-if="totalChurchPages > 1"
						     class="flex items-center justify-between border-t border-gray-200 dark:border-gray-600 p-3">
							<span class="text-xs text-gray-500 dark:text-gray-400">
								{{ data.churches_ranking.length }} iglesias - Página {{ churchPage }} de {{ totalChurchPages }}
							</span>
							<div class="flex items-center gap-1">
								<button :disabled="churchPage <= 1"
								        class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed
								               bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
								               hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
								        @click="churchPage = Math.max(1, churchPage - 1)">
									<i-ic-round-chevron-left class="text-sm"/>
								</button>
								<button v-for="p in totalChurchPages" :key="p"
								        class="w-8 h-8 text-xs font-bold rounded-lg transition-colors border"
								        :class="p === churchPage
								            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
								            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
								        @click="churchPage = p">
									{{ p }}
								</button>
								<button :disabled="churchPage >= totalChurchPages"
								        class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed
								               bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200
								               hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
								        @click="churchPage = Math.min(totalChurchPages, churchPage + 1)">
									<i-ic-round-chevron-right class="text-sm"/>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Bottom row: birthday + groups + by tariff + users -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<!-- Birthdays -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600
				            relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-pink-500"></div>
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 pl-2">
						<i class="i-ic-round-cake text-rose-500"></i>
						Cumplea&ntilde;eros
					</h3>
					<div class="pl-2">
						<div class="text-3xl font-bold text-rose-600 dark:text-rose-300 cursor-pointer hover:text-rose-700 dark:hover:text-rose-200 transition-colors"
						     @click="onBirthdayClick">
							{{ data.birthdays.count }}
						</div>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">durante el evento</p>
						<div v-if="data.birthdays.people.length" class="mt-3 space-y-1.5">
							<div v-for="person in data.birthdays.people.slice(0, 4)" :key="person.person_id"
							     class="flex items-center gap-2 text-xs p-1.5 rounded bg-rose-50 dark:bg-rose-900/20">
								<i class="i-ic-round-celebration text-rose-400 text-sm shrink-0"></i>
								<span class="text-gray-700 dark:text-gray-200 font-medium truncate">{{ person.fullname }}</span>
								<span class="text-gray-500 dark:text-gray-400 shrink-0">{{ person.age_at_event }} años</span>
							</div>
							<div v-if="data.birthdays.people.length > 4" class="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1 pl-1 cursor-pointer"
							     @click="onBirthdayClick">
								+{{ data.birthdays.people.length - 4 }} mas &rarr;
							</div>
						</div>
						<div v-else class="mt-3 text-xs text-gray-400 dark:text-gray-500">Sin cumpleaños</div>
					</div>
				</div>

				<!-- Groups -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600
				            relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-400 to-purple-500"></div>
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 pl-2">
						<i class="i-ic-round-receipt-long text-indigo-500"></i>
						Grupos
					</h3>
					<div class="pl-2">
						<div class="text-3xl font-bold text-indigo-600 dark:text-indigo-300">{{ data.groups.total }}</div>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ data.groups.average_size.toFixed(1) }} pers./grupo</p>
						<div class="mt-3 space-y-1.5">
							<div v-for="(count, status) in data.groups.by_payment_status" :key="status"
							     class="flex items-center justify-between text-xs p-1.5 rounded bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
								<span class="font-medium text-gray-600 dark:text-gray-300">{{ status }}</span>
								<span class="font-bold text-gray-900 dark:text-white">{{ count }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- By Tariff -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600
				            relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 pl-2">
						<i class="i-ic-round-local-offer text-amber-500"></i>
						Por tarifa
					</h3>
					<div class="pl-2 space-y-2">
						<div v-for="tarifa in data.financial.by_tarifa" :key="tarifa.tarifa_id"
						     class="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
							<div class="flex items-center justify-between">
								<div>
									<div class="text-xs font-bold text-gray-900 dark:text-white">{{ tarifa.description }}</div>
									<div class="text-xs text-gray-500 dark:text-gray-400">S/ {{ formatCurrency(tarifa.price) }} x
										{{ tarifa.inscription_count }}
									</div>
								</div>
								<div class="text-right">
									<div class="text-xs font-bold text-gray-900 dark:text-white">S/ {{ formatCurrency(tarifa.total_amount) }}</div>
									<div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">S/ {{ formatCurrency(tarifa.confirmed_amount) }}</div>
								</div>
							</div>
						</div>
						<div v-if="!data.financial.by_tarifa.length" class="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
							Sin tarifas configuradas
						</div>
					</div>
				</div>

				<!-- Users -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600
				            relative overflow-hidden">
					<div class="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-teal-500"></div>
					<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2 pl-2">
						<i class="i-ic-round-people text-cyan-500"></i>
						Usuarios
					</h3>
					<div class="pl-2">
						<div class="text-3xl font-bold text-cyan-600 dark:text-cyan-300">{{ data.users.total }}</div>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">asignados al evento</p>
						<div class="mt-3 space-y-1.5">
							<div v-for="(count, profile) in data.users.by_profile" :key="profile"
							     class="flex items-center justify-between text-xs p-1.5 rounded bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
								<span class="font-medium text-gray-600 dark:text-gray-300">{{ profileLabels[profile] || profile }}</span>
								<span class="font-bold text-gray-900 dark:text-white">{{ count }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Attendance summary (by status) -->
			<div v-if="data.churches_ranking.length"
			     class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border-2 border-gray-200 dark:border-gray-600 mb-6">
				<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
					<i class="i-ic-round-bar-chart text-cyan-500"></i>
					Desglose de inscripciones por estado
				</h3>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div v-for="item in totalByStatus" :key="item.status"
					     class="flex items-center gap-3 p-4 rounded-xl border-2"
					     :class="{
                            'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700': item.status === 'PENDIENTE',
                            'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700': item.status === 'CONFIRMADO',
                            'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700': item.status === 'RECHAZADO',
                            'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600': item.status === 'ERROR'
                         }">
						<i :class="[item.icon, 'text-2xl',
                            item.status === 'PENDIENTE' ? 'text-amber-500' : '',
                            item.status === 'CONFIRMADO' ? 'text-emerald-500' : '',
                            item.status === 'RECHAZADO' ? 'text-red-500' : '',
                            item.status === 'ERROR' ? 'text-gray-500' : '']"></i>
						<div>
							<div class="text-xl font-bold text-gray-900 dark:text-white">{{ item.count }}</div>
							<div class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ item.status }}</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
