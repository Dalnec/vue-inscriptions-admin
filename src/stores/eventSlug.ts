import { defineStore } from "pinia";

export const useEventSlugStore = defineStore("eventSlug", {
    state: () => ({
        slug: null as string | null
    }),
    actions: {
        setSlug(slug: string) {
            this.slug = slug;
        }
    }
});