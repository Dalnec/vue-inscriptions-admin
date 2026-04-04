import type { InterfaceAxiosApi, InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApi.ts";

export interface InterfaceActivities {
    created: null | Date;
    description: string;
    end_date: null | Date;
    id?: number | null;
    is_active: boolean;
    location: string;
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
}

export interface ActivityCardModel {
    category: string;
    date: string;
    id: number | null;
    image: string;
    location: string;
    title: string;
}

export const mapActivityToCard = (activity: InterfaceActivities): ActivityCardModel => {
    return {
        id: activity.id ?? null,
        title: activity.title,
        location: activity.location,

        // formateo de fecha
        date: activity.start_date
              ? new Date(activity.start_date).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
              : "Sin fecha",

        // fallback (no existe en backend aún)
        category: "Evento",

        // fallback (no existe en backend aún)
        image: "https://via.placeholder.com/400x300"
    };
};

export type InterfaceActionsActivities = InterfaceAxiosApiResponse<InterfaceActivities>
export type InterfaceResponseActivities = InterfaceAxiosApi<InterfaceActivities>
