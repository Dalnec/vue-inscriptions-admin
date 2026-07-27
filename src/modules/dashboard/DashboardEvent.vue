<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { Api } from "@/api/connection.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
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

const kindColors = [
	"from-violet-500 to-purple-600",
	"from-blue-500 to-indigo-600",
	"from-emerald-500 to-teal-600",
	"from-amber-500 to-orange-600"
];

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
			<div class="relative overflow-hidden rounded-2xl mb-6
                        bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500
                        dark:from-emerald-700 dark:via-teal-600 dark:to-cyan-700">
				<div class="absolute inset-0 opacity-10">
					<div class="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white"></div>
					<div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white"></div>
				</div>
				<div class="relative px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div class="text-white">
						<div class="flex items-center gap-2 flex-wrap">
							<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">{{ data.activity.title }}</h1>
							<span v-if="data.activity.shortname"
							      class="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full">{{ data.activity.shortname }}</span>
						</div>
						<p class="text-sm text-white/80 mt-1 flex items-center gap-1.5">
							<i class="i-ic-round-calendar-today text-sm"></i>
							{{ formatDate(data.activity.start_date) }} — {{ formatDate(data.activity.end_date) }}
						</p>
					</div>
					<div class="flex items-center gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                              :class="data.activity.is_active
                                ? 'bg-emerald-300/30 text-emerald-100'
                                : 'bg-gray-400/30 text-gray-200'">
                            {{ data.activity.is_active ? (data.activity.is_ended ? "Finalizado" : "Activo") : "Inactivo" }}
                        </span>
						<span v-if="data.activity.settings?.inscription?.send_email"
						      class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-300/30 text-blue-100 flex items-center gap-1">
                            <i class="i-ic-round-email text-xs"></i> Email
                        </span>
					</div>
				</div>
			</div>

			<!-- KPI Cards -->
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
					<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</span>
					<span class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ data.inscriptions.total }}</span>
					<span class="text-xs text-gray-400 dark:text-gray-500">inscripciones</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
					<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirmados</span>
					<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{
							data.inscriptions.by_status.CONFIRMADO || 0
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-500">inscripciones</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
					<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asistencia</span>
					<span class="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">{{ data.inscriptions.attended_count }}</span>
					<span class="text-xs text-gray-400 dark:text-gray-500">{{ formatPercent(data.inscriptions.attendance_rate) }}</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
					<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pendientes</span>
					<span class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{
							data.inscriptions.by_status.PENDIENTE || 0
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-500">por confirmar</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
					<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Esperado</span>
					<span class="text-2xl font-bold text-gray-900 dark:text-white mt-1">S/ {{
							formatCurrency(data.financial.total_expected)
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-500">ingreso total</span>
				</div>
				<div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
					<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contabilizado</span>
					<span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">S/ {{
							formatCurrency(data.financial.total_posted)
						}}</span>
					<span class="text-xs text-gray-400 dark:text-gray-500">ingresos reales</span>
				</div>
			</div>

			<!-- Main grid: inscriptions by kind + financial summary -->
			<div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
				<!-- Inscriptions by kind -->
				<div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-group text-cyan-500"></i>
						Inscripciones por tipo
					</h3>
					<div class="space-y-3">
						<div v-for="(kind, idx) in data.inscriptions.by_kind" :key="kind.kind_id ?? idx"
						     class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
							<div class="w-1 h-10 rounded-full"
							     :class="kindColors[idx % kindColors.length]"></div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<span class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ kind.kind }}</span>
									<span class="text-sm font-bold text-gray-900 dark:text-white">{{ kind.count }}</span>
								</div>
								<div class="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center gap-1">
                                        <i class="i-ic-round-check-circle text-emerald-500 text-xs"></i>
                                        {{ kind.confirmed }} conf.
                                    </span>
									<span class="flex items-center gap-1">
                                        <i class="i-ic-round-how-to-reg text-sky-500 text-xs"></i>
                                        {{ kind.attended }} asis.
                                    </span>
								</div>
								<div class="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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
				<div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-account-balance-wallet text-cyan-500"></i>
						Resumen financiero
					</h3>
					<div class="space-y-3">
						<div class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
							<span class="text-xs text-gray-600 dark:text-gray-300">Esperado</span>
							<span class="text-sm font-bold text-gray-900 dark:text-white">S/ {{
									formatCurrency(data.financial.total_expected)
								}}</span>
						</div>
						<div class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
							<span class="text-xs text-gray-600 dark:text-gray-300">Confirmado</span>
							<span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">S/ {{
									formatCurrency(data.financial.total_confirmed)
								}}</span>
						</div>
						<div class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
							<span class="text-xs text-gray-600 dark:text-gray-300">Contabilizado</span>
							<span class="text-sm font-bold text-sky-600 dark:text-sky-400">S/ {{
									formatCurrency(data.financial.total_posted)
								}}</span>
						</div>
						<div
							class="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
							<span class="text-xs font-medium text-amber-700 dark:text-amber-400">Por cobrar</span>
							<span class="text-sm font-bold text-amber-700 dark:text-amber-400">S/ {{
									formatCurrency(data.financial.pending_amount)
								}}</span>
						</div>
					</div>

					<hr class="my-4 border-gray-200 dark:border-gray-700">

					<!-- Payment methods -->
					<h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Por método de pago</h4>
					<div class="space-y-2">
						<div v-for="pm in data.financial.by_payment_method" :key="pm.payment_method_id"
						     class="flex items-center justify-between text-sm">
							<span class="text-gray-700 dark:text-gray-300">{{ pm.description }}</span>
							<span class="font-medium text-gray-900 dark:text-white">S/ {{ formatCurrency(pm.total_amount) }}</span>
						</div>
						<div v-if="!data.financial.by_payment_method.length"
						     class="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
							Sin movimientos registrados
						</div>
					</div>

					<!-- Cash balance -->
					<hr class="my-4 border-gray-200 dark:border-gray-700">
					<h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Balance de caja</h4>
					<div class="grid grid-cols-2 gap-2">
						<div class="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
							<span class="text-xs text-green-600 dark:text-green-400 block">Ingresos</span>
							<span class="text-sm font-bold text-green-700 dark:text-green-300">S/ {{
									formatCurrency(data.financial.cash_balance.total_incomes)
								}}</span>
						</div>
						<div class="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
							<span class="text-xs text-red-600 dark:text-red-400 block">Egresos</span>
							<span class="text-sm font-bold text-red-700 dark:text-red-300">S/ {{
									formatCurrency(data.financial.cash_balance.total_expenses)
								}}</span>
						</div>
						<div class="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-center col-span-2">
							<span class="text-xs text-cyan-600 dark:text-cyan-400 block">Total en caja</span>
							<span class="text-sm font-bold text-cyan-700 dark:text-cyan-300">S/ {{
									formatCurrency(data.financial.cash_balance.cash_total)
								}}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Gender distribution + Churches ranking -->
			<div class="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
				<!-- Gender -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-wc text-cyan-500"></i>
						Genero
					</h3>
					<div class="space-y-3">
						<div v-for="(count, gender) in data.inscriptions.by_gender" :key="gender"
						     class="flex items-center gap-3">
							<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
							     :class="gender === 'FEMENINO'
                                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'">
								{{ gender === "FEMENINO" ? "F" : "M" }}
							</div>
							<div class="flex-1">
								<div class="flex justify-between text-sm">
									<span class="text-gray-700 dark:text-gray-300 capitalize">{{ gender.toLowerCase() }}</span>
									<span class="font-semibold text-gray-900 dark:text-white">{{ count }}</span>
								</div>
								<div class="mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
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
				<div class="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
						<i class="i-ic-round-church text-cyan-500"></i>
						Ranking de iglesias
					</h3>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
							<tr class="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
								<th class="pb-2 font-medium">#</th>
								<th class="pb-2 font-medium">Iglesia</th>
								<th class="pb-2 font-medium text-right">Inscritos</th>
								<th class="pb-2 font-medium text-right">Confirmados</th>
								<th class="pb-2 font-medium text-right">Asistencia</th>
								<th class="pb-2 font-medium text-right">Total</th>
								<th class="pb-2 font-medium text-right">Confirmado</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="(church, idx) in data.churches_ranking" :key="church.church_id ?? idx"
							    class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
								<td class="py-2.5 pr-2 text-gray-400 dark:text-gray-500 text-xs font-mono">{{ idx + 1 }}</td>
								<td class="py-2.5 pr-4 font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
									{{ church.church_name }}
								</td>
								<td class="py-2.5 px-2 text-right font-semibold text-gray-900 dark:text-white">{{
										church.total_inscriptions
									}}
								</td>
								<td class="py-2.5 px-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{{
										church.confirmed
									}}
								</td>
								<td class="py-2.5 px-2 text-right text-sky-600 dark:text-sky-400 font-medium">{{ church.attended }}</td>
								<td class="py-2.5 px-2 text-right text-gray-700 dark:text-gray-300">S/
									{{ formatCurrency(church.total_amount) }}
								</td>
								<td class="py-2.5 pl-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">S/
									{{ formatCurrency(church.confirmed_amount) }}
								</td>
							</tr>
							<tr v-if="!data.churches_ranking.length">
								<td colspan="7" class="py-6 text-center text-sm text-gray-400 dark:text-gray-500">Sin iglesias registradas
								</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<!-- Bottom row: birthday + groups + by tariff + users -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<!-- Birthdays -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
						<i class="i-ic-round-cake text-rose-500"></i>
						Cumplea&ntilde;eros
					</h3>
					<div class="text-3xl font-bold text-rose-500 dark:text-rose-400">{{ data.birthdays.count }}</div>
					<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">durante el evento</p>
					<div v-if="data.birthdays.people.length" class="mt-3 space-y-1.5">
						<div v-for="person in data.birthdays.people.slice(0, 4)" :key="person.person_id"
						     class="flex items-center gap-2 text-xs">
							<i class="i-ic-round-celebration text-rose-400 text-sm shrink-0"></i>
							<span class="text-gray-700 dark:text-gray-300 truncate">{{ person.fullname }}</span>
							<span class="text-gray-400 dark:text-gray-500 shrink-0">{{ person.age_at_event }} años</span>
						</div>
						<div v-if="data.birthdays.people.length > 4" class="text-xs text-cyan-500 dark:text-cyan-400 mt-1">
							+{{ data.birthdays.people.length - 4 }} mas
						</div>
					</div>
					<div v-else class="mt-3 text-xs text-gray-400 dark:text-gray-500">Sin cumpleaños</div>
				</div>

				<!-- Groups -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
						<i class="i-ic-round-receipt-long text-indigo-500"></i>
						Grupos
					</h3>
					<div class="text-3xl font-bold text-indigo-500 dark:text-indigo-400">{{ data.groups.total }}</div>
					<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ data.groups.average_size.toFixed(1) }} pers./grupo</p>
					<div class="mt-3 space-y-1.5">
						<div v-for="(count, status) in data.groups.by_payment_status" :key="status"
						     class="flex items-center justify-between text-xs">
							<span class="text-gray-600 dark:text-gray-400">{{ status }}</span>
							<span class="font-semibold text-gray-900 dark:text-white">{{ count }}</span>
						</div>
					</div>
				</div>

				<!-- By Tariff -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
						<i class="i-ic-round-local-offer text-amber-500"></i>
						Por tarifa
					</h3>
					<div class="space-y-2">
						<div v-for="tarifa in data.financial.by_tarifa" :key="tarifa.tarifa_id"
						     class="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
							<div>
								<div class="font-medium text-gray-900 dark:text-white">{{ tarifa.description }}</div>
								<div class="text-gray-400 dark:text-gray-500">S/ {{ formatCurrency(tarifa.price) }} x
									{{ tarifa.inscription_count }}
								</div>
							</div>
							<div class="text-right">
								<div class="font-semibold text-gray-900 dark:text-white">S/ {{ formatCurrency(tarifa.total_amount) }}</div>
								<div class="text-emerald-500">S/ {{ formatCurrency(tarifa.confirmed_amount) }}</div>
							</div>
						</div>
						<div v-if="!data.financial.by_tarifa.length" class="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
							Sin tarifas configuradas
						</div>
					</div>
				</div>

				<!-- Users -->
				<div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
						<i class="i-ic-round-people text-cyan-500"></i>
						Usuarios
					</h3>
					<div class="text-3xl font-bold text-cyan-500 dark:text-cyan-400">{{ data.users.total }}</div>
					<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">asignados al evento</p>
					<div class="mt-3 space-y-1.5">
						<div v-for="(count, profile) in data.users.by_profile" :key="profile"
						     class="flex items-center justify-between text-xs">
							<span class="text-gray-600 dark:text-gray-400">{{ profileLabels[profile] || profile }}</span>
							<span class="font-semibold text-gray-900 dark:text-white">{{ count }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Attendance summary (by kind mini table) from churches -->
			<div v-if="data.churches_ranking.length"
			     class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
				<h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
					<i class="i-ic-round-bar-chart text-cyan-500"></i>
					Desglose de inscripciones por estado
				</h3>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
					<div v-for="item in totalByStatus" :key="item.status"
					     class="flex items-center gap-3 p-3 rounded-lg"
					     :class="{
                            'bg-amber-50 dark:bg-amber-900/20': item.status === 'PENDIENTE',
                            'bg-emerald-50 dark:bg-emerald-900/20': item.status === 'CONFIRMADO',
                            'bg-red-50 dark:bg-red-900/20': item.status === 'RECHAZADO',
                            'bg-gray-50 dark:bg-gray-700/50': item.status === 'ERROR'
                         }">
						<i :class="[item.icon, 'text-lg',
                            item.status === 'PENDIENTE' ? 'text-amber-500' : '',
                            item.status === 'CONFIRMADO' ? 'text-emerald-500' : '',
                            item.status === 'RECHAZADO' ? 'text-red-500' : '',
                            item.status === 'ERROR' ? 'text-gray-500' : '']"></i>
						<div>
							<div class="text-lg font-bold text-gray-900 dark:text-white">{{ item.count }}</div>
							<div class="text-xs text-gray-500 dark:text-gray-400">{{ item.status }}</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
