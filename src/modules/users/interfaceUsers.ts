import type { InterfaceAxiosApiNoPaginate, InterfaceAxiosApiResponse } from "@/composables/InterfaceAxiosApiNoPaginate.ts";
import type { InterfaceAxiosApiPaginate } from "@/composables/InterfaceAxiosApiPaginate.ts";

export interface InterfaceUsers {
    names: string;
    email: string;
    lastname: string;
    username: string;
    password?: string;
    passwordConfirm?: string;
    is_active: boolean;
    profile: number | null;
    id?: number;
}

export interface InterfaceProfile {
    description: string;
    id?: number;
    status: boolean;
}

export type UsersResponseMembers = InterfaceAxiosApiPaginate<InterfaceUsers>
export type UsersActiosMembersActions = InterfaceAxiosApiResponse<InterfaceUsers>

export type UsersActiosProfile = InterfaceAxiosApiNoPaginate<InterfaceProfile>
export type UsersActiosProfileActions = InterfaceAxiosApiResponse<InterfaceProfile>