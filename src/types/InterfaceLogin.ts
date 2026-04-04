import { type InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApi.ts";

export interface InterfaceLogin {
    user: User;
    token: string;
}

export interface User {
    activity: number;
    activity_shortname: string;
    email: string;
    gender: string;
    groups: any[];
    id: number;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_login: string;
    lastname: string;
    login_name: string;
    names: string;
    password: string;
    permissions: PermissionsInfo[];
    profile: number;
    profile_description: string;
    username: string;
}

export interface PermissionsInfo {
    children?: PermissionsInfo[];
    meta?: { permissions?: string[] };
    name: string;
    permissions?: string[];
}

export type InterfaceUserLoginActions = InterfaceAxiosApiResponse<InterfaceLogin> 
