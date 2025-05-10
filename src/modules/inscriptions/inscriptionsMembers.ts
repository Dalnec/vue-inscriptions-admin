
import type { InterfaceAxiosApiPaginate } from "@/composables/InterfaceAxiosApiPaginate.ts";
import type { InterfaceAxiosApiResponse } from "@/composables/InterfaceAxiosApiNoPaginate.ts";

export interface InscriptionsMembers {
    amount: string;
    person: Person;
    created: Date;
    observations: string;
    modified: Date;
    id: number;
    checkinat: Date;
    group: Group;
    status: string;
}

export interface Group {
    tarifa: Tarifa;
    activity: number;
    created: Date;
    modified: Date;
    voucheramount: string;
    id: number;
    vouchergroup: string;
    user: number;
    paymentmethod: Paymentmethod;
    voucherfile: string;
}

export interface Paymentmethod {
    icon: string;
    description: string;
    active: boolean;
    id: number;
    account: string;
}

export interface Tarifa {
    created: Date;
    price: string;
    modified: Date;
    description: string;
    active: boolean;
    id: number;
    selected: boolean;
}

export interface Person {
    birthdate: Date | string;
    code: string;
    gender: string;
    created: Date;
    doc_num: string;
    kind: number;
    church: number;
    documenttype: number;
    names: string;
    phone: string;
    modified: Date;
    lastnames: string;
    id: number;
    user: number;
    email: string;
    status: boolean;
}

export type InterfaceResponseInscriptions = InterfaceAxiosApiPaginate<InscriptionsMembers>
export type InterfaceActionsInscriptions = InterfaceAxiosApiResponse<InscriptionsMembers>
