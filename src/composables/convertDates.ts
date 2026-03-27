import { format, isValid, parse } from "date-fns";

const DATE_FORMATS = [
    "yyyy-MM-dd HH:mm:ss",
    "dd-MM-yyyy HH:mm:ss",
    "yyyy-MM-dd HH:mm",
    "dd-MM-yyyy HH:mm",

    "yyyy-MM-dd",
    "yyyy/MM/dd",
    "dd/MM/yyyy",
    "dd-MM-yyyy"
];

export function safeParseToDate(input: string | Date | null | undefined): Date | null {
    if ( !input) return null;

    if (input instanceof Date && isValid(input)) {
        const d = new Date(input);
        d.setHours(12, 0, 0, 0);
        return d;
    }

    if (typeof input === "string") {
        const parts = input.split("-").map(Number);
        if (parts.length !== 3) return null;

        // Detectar formato: si el primer segmento tiene 4 dígitos es yyyy-MM-dd, sino dd-MM-yyyy
        let day: number, month: number, year: number;
        if (parts[0] > 31) {
            [ year, month, day ] = parts;
        } else {
            [ day, month, year ] = parts;
        }

        if ( !day || !month || !year) return null;

        const d = new Date(year, month - 1, day);
        d.setHours(12, 0, 0, 0);
        return d;
    }

    return null;
}

export function parseToDate(dateStr: string): Date | null {
    for (const format of DATE_FORMATS) {
        const parsed = parse(dateStr, format, new Date());
        if (isValid(parsed)) return parsed;
    }
    return null;
}

export function formatDateToString(date: Date, formatStr: string = "yyyy-MM-dd"): string {
    return format(date, formatStr);
}

export function parseHourToDate(time?: string | null): Date | null {
    if ( !time) return null;

    const parts = time.split(":");
    if (parts.length < 2) return null;

    const [ h, m, s = "0" ] = parts;
    const hours = Number(h);
    const minutes = Number(m);
    const seconds = Number(s);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) return null;

    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
}

export function formatDateToHour(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${ pad(date.getHours()) }:${ pad(date.getMinutes()) }:${ pad(date.getSeconds()) }`;
}
