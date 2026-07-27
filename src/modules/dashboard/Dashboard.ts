export interface DashboardData {
    activity: Activity;
    birthdays: Birthdays;
    churches_ranking: ChurchesRanking[];
    financial: Financial;
    groups: Groups;
    inscriptions: Inscriptions;
    users: Users;
}

export interface Activity {
    end_date: string;
    id: number;
    is_active: boolean;
    is_ended: boolean;
    settings: Settings;
    shortname: string;
    start_date: string;
    title: string;
}

export interface Settings {
    inscription: Inscription
}

export interface Inscription {
    emails: string[];
    send_email: boolean;
}

export interface Inscriptions {
    attendance_rate: number;
    attended_count: number;
    by_gender: ByGender;
    by_kind: ByKind[];
    by_status: ByStatus;
    total: number;
}

export interface ByStatus {
    CONFIRMADO: number;
    ERROR: number;
    PENDIENTE: number;
    RECHAZADO: number;
}

export interface ByGender {
    FEMENINO: number
    MASCULINO: number
}

export interface ByKind {
    attended: number;
    confirmed: number;
    count: number;
    kind: string;
    kind_id: number;
}

export interface Birthdays {
    count: number
    people: People[]
}

export interface People {
    age_at_event: number;
    birthdate: string;
    church_name: string;
    fullname: string;
    gender: string;
    inscription_status: string;
    kind: string;
    person_id: number;
}

export interface Financial {
    by_payment_method: ByPaymentMethod[];
    by_tarifa: ByTarifa[];
    cash_balance: CashBalance;
    pending_amount: string;
    total_confirmed: string;
    total_expected: string;
    total_posted: string;
}

export interface ByTarifa {
    confirmed_amount: string;
    description: string;
    inscription_count: number;
    price: string;
    tarifa_id: number;
    total_amount: string;
}

export interface ByPaymentMethod {
    description: string;
    movement_count: number;
    payment_method_id: number;
    total_amount: string;
}

export interface CashBalance {
    cash_total: string;
    movement_count: number;
    total_expenses: string;
    total_incomes: string;
}

export interface ChurchesRanking {
    attended: number;
    by_kind: ByKind2[];
    church_id: number;
    church_name: string;
    confirmed: number;
    confirmed_amount: string;
    total_amount: string;
    total_inscriptions: number;
}

export interface ByKind2 {
    count: number;
    kind: string;
    kind_id: number;
}

export interface Groups {
    average_size: number;
    by_payment_status: ByPaymentStatus;
    total: number;
}

export interface ByPaymentStatus {
    CONFIRMADO: number;
    ERROR: number;
    PENDIENTE: number;
    RECHAZADO: number;
}

export interface Users {
    by_profile: ByProfile;
    total: number;
}

export interface ByProfile {
    ADMINISTRADOR: number;
    CAJA: number;
    INSCRIPCIONES: number;
}
