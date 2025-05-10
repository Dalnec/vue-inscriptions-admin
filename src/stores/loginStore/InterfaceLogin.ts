import { type InterfaceAxiosApiResponse } from "@/composables/InterfaceAxiosApiNoPaginate";

export interface InterfaceLogin {
    user: User;
    token: string;
}

export interface User {
    id: number
    password: string
    last_login: string
    is_superuser: boolean
    username: string
    names: any
    email: string
    lastname: any
    gender: string
    is_staff: boolean
    is_active: boolean
    profile: number
    profile_description: string
    groups: any[]
    user_permissions: any[]
}

export type InterfaceUserLoginActions = InterfaceAxiosApiResponse<InterfaceLogin> 
