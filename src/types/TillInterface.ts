export interface MovementInterface {
    activity: number;
    amount: string;
    concept: number;
    description: string;
    inscription: number;
    movement_at: string;
    payment_method: number;
    reference: string;
    reversal_of: number;
    status: string;
    user: number;
}

export interface MovementsMetaInterface {
    cash_total: string;
    movement_count: number;
    total_expenses: string;
    total_incomes: string;
    total_inscriptions: string;
}
