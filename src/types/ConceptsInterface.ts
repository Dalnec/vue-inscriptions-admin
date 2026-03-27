import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export interface ConceptsInterface {
    concept_type: "I" | "E";
    description: string;
    readonly id?: number;
    is_active: boolean;
    is_internal: boolean;
}

export type ConceptsInterfaceResponse = InterfaceAxiosApiPaginate<ConceptsInterface>
