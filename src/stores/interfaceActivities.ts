
export interface InterfaceActivities {
    end_date:    Date;
    settings:    Settings;
    is_active:   boolean;
    created:     Date;
    modified:    Date;
    description: string;
    location:    string;
    id:          number;
    title:       string;
    start_date:  Date;
}

export interface Settings {
    inscription: Inscription;
}

export interface Inscription {
    emails:     string[];
    send_email: boolean;
    show_tarifas?: boolean;
}
