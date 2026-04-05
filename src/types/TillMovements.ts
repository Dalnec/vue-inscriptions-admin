import type { InterfaceAxiosApiPaginate, InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApi.ts";

export interface TillMovements {
    movement_at: string;
    description: string;
    reference: string;
    amount: string;
    status: string;
    concept: number;
    payment_method: number;
    inscription: number;
    user: number;
    activity: number;
    reversal_of: number;
}

export type TillMovementResponse = InterfaceAxiosApiPaginate<TillMovements>
export type TillMovementActions = InterfaceAxiosApiResponse<TillMovements>