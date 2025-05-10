<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCookies } from "@vueuse/integrations/useCookies";
import { useDark } from "@vueuse/core";
import Drawer from "primevue/drawer";

const selectedPrimary = ref<{ type: string; name: string, palette: [] }>({ type: "primary", name: "amber", palette: [] });
const selectedSurface = ref<{ type: string; name: string, palette: [] }>({ type: "surface", name: "slate", palette: [] });
const scales = ref<number[]>([ 12, 13, 14, 15, 16, 17, 18 ]);
const visible = ref<boolean>(false);
const textSize = ref<number>(15);
const cookies = useCookies();

const isDark = useDark({ disableTransition: false, initialValue: "auto" });
const toggleDrawer = (): boolean => visible.value = !visible.value;

interface ColorPalette {
    name: string;
    palette: string[];
}

interface SchemaColor {
    label: string;
    type: string;
    selected: { type: string; name: string; palette?: string[] };
    palettes: ColorPalette[];
}

const schemaColor = ref<SchemaColor[]>([
    {
        label: "Colores Primarios", type: "primary", selected: selectedPrimary.value, palettes: [
            {
                name: "emerald",
                palette: [ "#ECFDF5", "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981", "#059669", "#047857", "#065F46", "#044E38",
                    "#022C22" ]
            },
            {
                name: "red",
                palette: [ "#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D",
                    "#450A0A" ]
            },
            {
                name: "orange",
                palette: [ "#FFF7ED", "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#C2410C", "#9A3412", "#7C2D12",
                    "#431407" ]
            },
            {
                name: "amber",
                palette: [ "#FFFBEB", "#FEF3C7", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F",
                    "#451A03" ]
            },
            {
                name: "yellow",
                palette: [ "#FEFCE8", "#FEF9C3", "#FEF08A", "#FDE047", "#FACC15", "#EAB308", "#CA8A04", "#A16207", "#824D0E", "#713F12",
                    "#421D06" ]
            },
            {
                name: "teal",
                palette: [ "#F0FDF8", "#CCFBF1", "#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488", "#0F766E", "#155E59", "#144E4A",
                    "#042F2E" ]
            },
            {
                name: "cyan",
                palette: [ "#ECFEFF", "#CFFAFE", "#A5F3FC", "#67E8F9", "#22D3EE", "#06B6D4", "#0891B2", "#0E7490", "#155E75", "#164E63",
                    "#083344" ]
            },
            {
                name: "sky",
                palette: [ "#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8", "#0EA5E9", "#0284C7", "#0369A1", "#155E85", "#0C4A6E",
                    "#082F49" ]
            },
            {
                name: "blue",
                palette: [ "#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A",
                    "#172554" ]
            },
            {
                name: "indigo",
                palette: [ "#EEF2FF", "#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1", "#4F46E5", "#4338CA", "#3730A3", "#312E81",
                    "#1E1B4B" ]
            },
            {
                name: "violet",
                palette: [ "#F5F3FF", "#EDE9FE", "#DDD6FE", "#C4B5FD", "#A78BFA", "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95",
                    "#321766" ]
            },
            {
                name: "purple",
                palette: [ "#FAF5FF", "#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7E22CE", "#6B21A8", "#581C87",
                    "#3B1464" ]
            },
            {
                name: "fuchsia",
                palette: [ "#FDF4FF", "#FAE8FF", "#F5D0FE", "#F0ABFC", "#E879F9", "#D946EF", "#C026D3", "#A416AF", "#7E2299", "#6D2879",
                    "#4A084E" ]
            },
            {
                name: "pink",
                palette: [ "#FDF2F8", "#FCE7F3", "#FBCFE8", "#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#BE185D", "#9D174D", "#831843",
                    "#500724" ]
            },
            {
                name: "rose",
                palette: [ "#FFF1F2", "#FFE4E6", "#FECDD3", "#FDA4AF", "#FB7185", "#F43F5E", "#E11D48", "#BE123C", "#9F1239", "#881237",
                    "#4C0519" ]
            },
            {
                name: "noir",
                palette: [ "#FAFAFA", "#F4F4F5", "#E4E4E7", "#D4D4D8", "#A1A1AA", "#71717A", "#52525B", "#3F3F46", "#27272A", "#18181B",
                    "#09090B" ]
            }
        ]
    },
    {
        label: "Colores Secundarios", type: "surface", selected: selectedSurface.value, palettes: [
            {
                name: "slate",
                palette: [ "#FFFFFF", "#F8FAFC", "#F1F5F9", "#E2E8F0", "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155", "#1E293B",
                    "#0F172A", "#020617" ]
            },
            {
                name: "gray",
                palette: [ "#FFFFFF", "#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937",
                    "#111827", "#03070F" ]
            },
            {
                name: "zinc",
                palette: [ "#FFFFFF", "#FAFAFA", "#F4F4F5", "#E4E4E7", "#D4D4D8", "#A1A1AA", "#71717A", "#52525B", "#3F3F46", "#27272A",
                    "#18181B", "#09090B" ]
            },
            {
                name: "neutral",
                palette: [ "#FFFFFF", "#FAFAFA", "#F5F5F5", "#E5E5E5", "#D4D4D4", "#A3A3A3", "#737373", "#525252", "#404040", "#262626",
                    "#171717", "#0A0A0A" ]
            },
            {
                name: "stone",
                palette: [ "#FFFFFF", "#FAFAFA", "#F4F4F5", "#E4E4E7", "#D4D4D8", "#A1A1AA", "#71717A", "#52525B", "#383A3F", "#16181D",
                    "#0C0E14", "#09090B" ]
            },
            {
                name: "soho",
                palette: [ "#FFFFFF", "#F4F4F4", "#E8E9E9", "#D2D2D4", "#BBBEBE", "#A5A5A9", "#8E8F93", "#77787D", "#616268", "#4A4B52",
                    "#34333D", "#1D1E27" ]
            },
            {
                name: "ocean",
                palette: [ "#FFFFFF", "#FBFCFC", "#F7F9F8", "#EFF3F2", "#DAE0DF", "#B1B7B6", "#828787", "#5F7274", "#415B61", "#29444E",
                    "#183240", "#0C191F" ]
            }
        ]
    }
]);

const updateColors = (type: string, colorName: string): void => {
    const colorSchema = schemaColor.value.find((color) => color.type === type);
    const selectedColor = colorSchema?.palettes.find((palette) => palette.name === colorName);

    if (selectedColor && colorSchema) {
        colorSchema.selected = { ...selectedColor, type };
        cookies.set(type, { type, name: colorName }, { path: "/", sameSite: true });

        if ( !document?.startViewTransition) {
            applyTheme(type, selectedColor.palette);
        } else {
            document.startViewTransition(() => applyTheme(type, selectedColor.palette));
        }
    }
};

function adjustTextSize(amount: number) {
    textSize.value += amount;
    document.documentElement.style.fontSize = `${ textSize.value }px`;
    cookies.set("font-size", textSize.value, { path: "/", sameSite: true });
}

const loadTheme = (type: string, savedColor: { type: string; name: string } | null, defaultColor: { type: string; name: string }): void => {
    const colorSchema = schemaColor.value.find((color) => color.type === type);
    const selected = savedColor ? colorSchema?.palettes.find((palette) => palette.name === savedColor.name) : null;
    const finalColor = selected || colorSchema?.palettes.find((palette) => palette.name === defaultColor.name);

    if (finalColor && colorSchema) {
        colorSchema.selected = { ...finalColor, type };
        applyTheme(type, finalColor.palette);
    }
};

onMounted(() => {
    textSize.value = cookies.get("font-size") || textSize.value;
    document.documentElement.style.fontSize = `${ textSize.value }px`;

    loadTheme("primary", cookies.get("primary"), selectedPrimary.value);
    loadTheme("surface", cookies.get("surface"), selectedSurface.value);
});

const applyTheme = (type: string, colors?: string[]): void => {
    const increments = type === "primary"
                       ? [ 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 ]
                       : [ 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 ];

    colors?.forEach((color, index) => {
        document.documentElement.style.setProperty(`--p-${ type }-${ increments[index] }`, color);
    });
};

</script>

<template>
    <Button size="small" @click="toggleDrawer" class="!w-8 h-8">
        <template #icon>
            <i-carbon-color-palette/>
        </template>
    </Button>
    <Drawer v-model:visible="visible" position="right" header="Configuración de estilos" modal>
        <div class="align-item-config">
            <span class="app-label-config">Escala</span>
            <div class="inline-flex items-center gap-2 rounded-2xl p-1 border-1 surface-border">
                <Button @click="adjustTextSize(-1)" text rounded :disabled="textSize === scales[0]">
                    <template #icon>
                        <i-ic-twotone-text-decrease/>
                    </template>
                </Button>
                <i v-for="s in scales" :key="s" :class="['text-sm text-200', { 'text-lg text-primary': s === textSize }]">
                    <i-material-symbols-circle/>
                </i>
                <Button @click="adjustTextSize(1)" text rounded :disabled="textSize === scales[scales.length - 1]">
                    <template #icon>
                        <i-ic-baseline-text-increase/>
                    </template>
                </Button>
            </div>
        </div>
        <div class="align-item-config">
            <span class="app-label-config">Elige tu modo</span>
            <ToggleButton v-model="isDark" id="estado" size="small" onLabel="Claro" offLabel="Oscuro" class="w-full">
                <template #icon>
                    <i-ic-round-light-mode v-if="isDark"/>
                    <i-ic-round-dark-mode v-else/>
                </template>
            </ToggleButton>
        </div>
        <div class="align-item-config">
            <div v-for="{label, type, palettes, selected} in schemaColor" :key="type">
                <span class="app-label-config">{{ label }}</span>
                <div class="inline-flex flex-wrap items-start justify-start gap-1 self-stretch">
                    <button v-for="primary of palettes" :key="primary.name" type="button" @click="updateColors(type, primary.name)"
                            class="h-5 w-10 cursor-pointer rounded-sm transition-all transition-duration-200"
                            :style="{ backgroundColor: `${primary.palette[5]}` }"
                            :class="{
                    'ring-2 ring-offset-2 dark:ring-offset-surface-800': selected.name === primary.name,
                    'ring-primary-500': type === 'primary' && selected.name === primary.name,
                    'ring-surface-500': type === 'surface' && selected.name === primary.name }">
                    </button>
                </div>
            </div>
        </div>
    </Drawer>
</template>
