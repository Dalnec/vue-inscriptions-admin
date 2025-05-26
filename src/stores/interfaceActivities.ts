import type { InterfaceAxiosApiResponse } from "@/composables/InterfaceAxiosApiNoPaginate.ts";

export interface InterfaceActivities {
    created: null | Date;
    description: string;
    end_date: null | Date;
    id?: number | null;
    is_active: boolean;
    location: string;
    modified: null | Date;
    settings: Settings;
    start_date: null | Date;
    title: string;
}

export interface Settings {
    inscription: Inscription;
}

export interface Inscription {
    emails: string[];
    send_email: boolean;
    show_tarifas?: boolean;
}

export interface PaymentMethod {
    account: string | null,
    active: boolean,
    cci: string | null,
    description: string,
    icon: string | null,
    id: null | number
}

export type InterfaceActionsActivities = InterfaceAxiosApiResponse<InterfaceActivities>
