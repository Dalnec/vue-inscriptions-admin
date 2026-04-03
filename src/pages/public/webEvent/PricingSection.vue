<script setup lang="ts">
import pageConfig from "@/assets/page_config.json";
import router from "@/router";

const { pricing_plans } = pageConfig;

const handleCTA = (plan: any) => {
    if (plan.whatsapp_link) {
        window.open(plan.whatsapp_link, "_blank");
    } else {
        router.push({ name: "inscription-members" });
    }
};
</script>

<template>
    <section class="bg-slate-900 py-20 px-4" id="pricing">
        <div class="max-w-6xl mx-auto">
            <!-- HEADER -->
            <div class="text-center mb-16">
                <div class="w-32 h-1 bg-amber-400 mx-auto mb-6 rounded-full"></div>

                <h2 class="text-3xl md:text-5xl font-info text-white leading-tight motto-font">
                    {{ pricing_plans.section_title }}
                </h2>

                <p class="mt-4 text-slate-400 max-w-2xl mx-auto">
                    Elige el plan que mejor se adapte a ti
                </p>
            </div>

            <!-- PLANS GRID -->
            <div class="grid md:grid-cols-2 gap-8 items-center">
                <div v-for="(plan, index) in pricing_plans.plans" :key="index"
                     :class="['pricing-card', plan.is_recommended && 'recommended']">

                    <!-- BADGE RECOMENDADO -->
                    <div v-if="plan.is_recommended" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span class="bg-amber-400 text-slate-950 px-4 py-1 rounded-full text-sm font-bold">
                            RECOMENDADO
                        </span>
                    </div>

                    <!-- CONTENIDO -->
                    <div class="flex flex-col h-full">
                        <!-- ENCABEZADO -->
                        <div class="mb-6">
                            <h3 class="text-2xl font-bold text-white mb-2">
                                {{ plan.name }}
                            </h3>
                            <p class="text-slate-400 text-sm">
                                {{ plan.subtitle }}
                            </p>
                        </div>

                        <!-- PRECIO -->
                        <div class="mb-6">
                            <div class="flex items-baseline gap-2">
                                <span class="text-4xl font-bold text-white">
                                    {{ pricing_plans.currency }}{{ plan.price }}
                                </span>
                                <span v-if="plan.original_price" class="text-slate-400 line-through text-lg">
                                    {{ pricing_plans.currency }}{{ plan.original_price }}
                                </span>
                            </div>
                        </div>

                        <!-- BENEFICIOS -->
                        <div class="mb-8 flex-grow">
                            <ul class="space-y-3">
                                <li v-for="(benefit, idx) in plan.benefits" :key="idx"
                                    class="flex items-start gap-3 text-slate-300">
                                    <svg class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                    <span>{{ benefit }}</span>
                                </li>
                            </ul>
                        </div>

                        <!-- CTA BUTTON -->
                        <Button @click="handleCTA(plan)"
                                :label="plan.cta_text"
                                class="w-full rounded-xl font-semibold py-3"
                                :class="plan.is_recommended 
                                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-500' 
                                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'"/>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.pricing-card {
    @apply relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm;
    transition: all 0.3s ease;
}

.pricing-card:hover {
    @apply bg-white/10 border-white/20;
    transform: translateY(-4px);
}

.pricing-card.recommended {
    @apply border-amber-400/50 bg-amber-400/5;
}

.pricing-card.recommended:hover {
    @apply border-amber-400/80 bg-amber-400/10;
}
</style>



