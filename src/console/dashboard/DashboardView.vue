<script setup lang="ts">
import * as echarts from "echarts";
import { ref, onMounted, watch, computed } from "vue";
import { useDark } from "@vueuse/core";
import { Api } from "@/api/connection.ts";
import type { InterfaceActivities, InterfaceResponseActivities } from "@/types/interfaceActivities.ts";

let chartInstance: echarts.ECharts | null = null;
const chartRef = ref<HTMLDivElement | null>(null);
const totalRegistrations = ref(24892);
const revenueUSD = ref(1200000);
const activeEvents = ref(42);
const activityOptions = ref<InterfaceActivities[]>([]);
const upcomingEvents = ref<Event[]>([]);

interface Event {
    id: number;
    title: string;
    description: string;
    location_text: string;
    date: string;
    status: string;
}

const dark = useDark();

const trendingEvent = computed(() => {
    if (upcomingEvents.value.length === 0) return null;
    return upcomingEvents.value[0];
});

const onGetEvents = async() => {
    const { response }: InterfaceResponseActivities = await Api.Get({ route: "activity" });
    if (response && response.status === 200) {
        activityOptions.value = response.data;

        upcomingEvents.value = activityOptions.value.filter((e: any) => e.is_active).map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            location_text: e.location_text,
            date: new Date(e.start_date).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }),
            status: e.is_active ? "Active" : "Inactive",
            shortname: e.shortname
        }));
    }
};

const data = [ 120, 200, 150, 80, 70, 110, 130 ];

const initChart = () => {
    if ( !chartRef.value) return;

    if ( !chartInstance) chartInstance = echarts.init(chartRef.value);

    chartInstance.setOption({
        textStyle: {
            color: dark.value ? "#fff" : "#1f2937" // color de textos
        },
        tooltip: {
            trigger: "axis",
            backgroundColor: dark.value ? "#334155" : "#f3f4f6",
            textStyle: {
                color: dark.value ? "#fff" : "#111827"
            }
        },
        xAxis: {
            type: "category",
            data: [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ],
            axisLine: { lineStyle: { color: dark.value ? "#94a3b8" : "#6b7280" } },
            axisLabel: { color: dark.value ? "#fff" : "#374151" }
        },
        yAxis: {
            type: "value",
            axisLine: { lineStyle: { color: dark.value ? "#94a3b8" : "#6b7280" } },
            axisLabel: { color: dark.value ? "#fff" : "#374151" },
            splitLine: { lineStyle: { color: dark.value ? "#334155" : "#e5e7eb" } }
        },
        series: [
            {
                data,
                type: "line",
                smooth: true,
                lineStyle: { color: "#06b6d4" }, // línea cyan
                itemStyle: { color: "#06b6d4" },
                areaStyle: {
                    color: dark.value
                           ? "rgba(6,182,212,0.2)"
                           : "rgba(6,182,212,0.1)"
                }
            }
        ]
    });
};

// Cuando cambie dark mode, actualiza el gráfico
watch(dark, () => {
    initChart();
});
onMounted(async() => {
    initChart();
    await onGetEvents();
});

</script>

<template>
    <div class="flex flex-col gap-6 p-6 dark:bg-slate-900 bg-slate-50">

        <!-- Top Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">Total Registrations</span>
                <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalRegistrations }}</span>
                <span class="text-xs text-green-600 dark:text-green-400">+12.5% vs last month</span>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">Revenue (USD)</span>
                <span class="text-2xl font-bold text-gray-900 dark:text-white">${{ (revenueUSD / 1000000).toFixed(1) }}M</span>
                <span class="text-xs text-green-600 dark:text-green-400">+8.2% vs last month</span>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400">Active Events</span>
                <span class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeEvents }}</span>
                <span class="text-xs text-red-600 dark:text-red-400">Live Now</span>
            </div>

            <div class="bg-purple-500 dark:bg-purple-600 p-4 rounded-lg shadow flex flex-col justify-between">
                <span class="font-bold text-white dark:text-white">Create a New Campaign</span>
                <small class="text-white/80 dark:text-white/70">Drive engagement now</small>
            </div>
        </div>

        <!-- Graph + Featured Event -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div ref="chartRef" class="w-full h-72"></div>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col justify-between">
                <span class="text-pink-500 text-xs font-semibold">Top evento</span>
                <img src="@/assets/images/portTarapoto.jpg" alt="Trending Event"
                     class="rounded my-2 object-cover h-40 w-full"/>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                    {{ trendingEvent ? trendingEvent.title : "Cargando..." }}
                </h3>
                <p class="text-xs text-gray-600 dark:text-gray-300">
                    {{ trendingEvent ? trendingEvent.description : "" }}
                </p>
                <Button v-if="trendingEvent" class="mt-2" severity="info" label="Manage Event"/>
            </div>
        </div>

        <!-- Upcoming Events -->
        <div class="flex flex-col gap-3">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Eventos recientes</h2>
            <div class="flex flex-col gap-3">
                <div v-for="event in upcomingEvents" :key="event.id"
                     class="bg-white dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center shadow">
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white">{{ event.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ event.date }} • {{ event.location_text }}</p>
                        <p class="text-xs text-gray-400 dark:text-gray-300">{{ event.description }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-900 dark:text-white">
                            {{ event.status }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>