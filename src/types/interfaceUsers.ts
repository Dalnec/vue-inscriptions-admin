import type { InterfaceAxiosApiNoPaginate, InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApiNoPaginate.ts";
import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApiPaginate.ts";

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

export type UsersActionsProfile = InterfaceAxiosApiNoPaginate<InterfaceProfile>
// export type UsersActiosProfileActions = InterfaceAxiosApiResponse<InterfaceProfile>