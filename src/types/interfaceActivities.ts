import type { InterfaceAxiosApi, InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApi.ts";

export interface InterfaceActivities {
    created: null | Date;
    description: string;
    end_date: null | Date;
    id?: number | null;
    is_active: boolean;
    location: {
        lat: number | null;
        lng: number | null;
    };
    location_text: string;
    modified: null | Date;
    settings: Settings;
    shortname: string;
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
    account?: string | null,
    active?: boolean,
    cci?: string | null,
    description: string,
    icon?: string | null,
    id?: null | number
    activity: null | number
}

export type InterfaceActionsActivities = InterfaceAxiosApiResponse<InterfaceActivities>
export type InterfaceResponseActivities = InterfaceAxiosApi<InterfaceActivities>
