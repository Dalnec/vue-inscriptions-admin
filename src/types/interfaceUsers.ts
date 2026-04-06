import type { InterfaceAxiosApi, InterfaceAxiosApiPaginate, InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApi.ts";

export interface InterfaceUsers {
    activity: number | null;
    email: string;
    id?: number;
    is_active: boolean;
    lastname: string;
    names: string;
    readonly login_name: string;
    password?: string;
    passwordConfirm?: string;
    profile: number | null;
    username: string;
}

export interface InterfaceProfile {
    description: string;
    id?: number;
    status: boolean;
}

export type UsersResponseMembers = InterfaceAxiosApiPaginate<InterfaceUsers>
export type UsersActiosMembersActions = InterfaceAxiosApiResponse<InterfaceUsers>

export type UsersActionsProfile = InterfaceAxiosApi<InterfaceProfile>
// export type UsersActiosProfileActions = InterfaceAxiosApiResponse<InterfaceProfile>