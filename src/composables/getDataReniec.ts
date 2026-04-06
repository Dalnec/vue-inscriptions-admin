import { useDebounceFn } from "@vueuse/core";
import useGlobalToast from "@/composables/toastEvent";
import { Api } from "@/api/connection";

export interface InterfaceResponseDNI<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface DataDNI {
    apellido_materno: string;
    apellido_paterno: string;
    codigo_verificacion: number;
    departamento: string;
    direccion: string;
    direccion_completa: string;
    distrito: string;
    nombre_completo: string;
    nombres: string;
    numero: string;
    provincia: string;
    ubigeo: string[];
    ubigeo_reniec: string;
    ubigeo_sunat: string;
}

export interface MemberExist {
    birthdate: any;
    church: number;
    church_description: string;
    code: string;
    created: string;
    doc_num: string;
    documenttype: number;
    documenttype_description: string;
    email: any;
    gender: string;
    kind: number;
    lastnames: string;
    names: string;
    phone: string;
    status: boolean;
    user: any;
}

const EMPTY_DNI: DataDNI = {
    apellido_materno: "", apellido_paterno: "", codigo_verificacion: 0, departamento: "", direccion: "", direccion_completa: "",
    distrito: "", nombre_completo: "", nombres: "", numero: "", provincia: "", ubigeo: [], ubigeo_reniec: "", ubigeo_sunat: ""
};


const buildError = (message: string): InterfaceResponseDNI<MemberExist | DataDNI> => ({ success: false, message, data: { ...EMPTY_DNI } });

const showSuccessToast = () => {
    useGlobalToast({ detail: "Datos encontrados", severity: "success", summary: "Éxito" });
};

export const getDataReniec = useDebounceFn(async(consult: string): Promise<InterfaceResponseDNI<MemberExist | DataDNI>> => {
    const cleanConsult = consult?.trim();

    if ( !cleanConsult) {
        return buildError("Agregue un número válido");
    }

    const isValidLength = cleanConsult.length === 8 || cleanConsult.length === 11;

    if ( !isValidLength) {
        return buildError("Número inválido (Debe tener 8 o 11 dígitos)");
    }

    try {
        const { response } = await Api.Get({ route: `person/apiclient/${ cleanConsult }` });

        const apiData = response?.data;

        if ( !apiData || apiData.success === false) {
            return buildError("No se encontró información.");
        }

        // Normalización de respuesta
        const message = apiData.message?.includes("encuentra") ? apiData.message : "Datos encontrados";
        showSuccessToast();

        return { success: true, message, data: apiData.data };
    } catch (error) {
        console.error("Error al consultar RENIEC:", error);
        return buildError("No se pudo obtener la información");
    }
}, 500);
