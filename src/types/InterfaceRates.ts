import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export interface InterfaceRates {
    active: boolean,
    created?: string,
    description: string,
    id?: number,
    modified?: string,
    price: string,
    selected: boolean
}

export type InterfaceRatesResponse = InterfaceAxiosApiPaginate<InterfaceRates>