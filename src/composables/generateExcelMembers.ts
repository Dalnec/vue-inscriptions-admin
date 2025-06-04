import ExcelJS from "exceljs";
import type { InscriptionsMembers } from "@/modules/inscriptions/inscriptionsMembers.ts";

export async function exportInscriptionsToExcel(data: InscriptionsMembers[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inscripciones");

    // Definir encabezados con offset (desde columna B)
    const headers = [
        "Nombres",
        "Apellidos",
        "Documento",
        "Género",
        "Teléfono",
        "Correo",
        "Edad",
        "Tipo de Miembro",
        "Iglesia",
        "Actividad",
        "Monto",
        "Método de Pago",
        "Check-in",
        "Estado",
        "Observaciones"
    ];

    // Colocar encabezados desde la fila 2, columna B
    headers.forEach((header, i) => {
        const cell = worksheet.getRow(2).getCell(i + 2); // Columna B es índice 2
        cell.value = header;
        cell.font = { bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFC600" }
        };
    });

    // Insertar datos desde fila 3, columna B
    data.forEach((item, rowIndex) => {
        const row = worksheet.getRow(rowIndex + 3); // Comienza desde fila 3
        const values = [
            item.person.names,
            item.person.lastnames,
            item.person.doc_num,
            item.person.gender,
            item.person.phone,
            item.person.email,
            item.person.age ?? "",
            item.person.kind_description,
            item.person.church_description,
            item.group.vouchergroup,
            item.amount,
            item.group.paymentmethod.description,
            item.checkinat ? formatDate(item.checkinat) : "",
            item.status_description,
            item.observations
        ];
        values.forEach((val, colIndex) => {
            row.getCell(colIndex + 2).value = val; // Desplazamiento desde columna B
            row.getCell(colIndex + 2).alignment = {
                vertical: "middle",
                horizontal: "left"
            };
        });
    });

    // Ajustar ancho automático
    worksheet.columns.forEach((col, i) => {
        if ( !col || i === 0) return;
        const values = col.values ?? [];
        col.width = values.reduce((max: number, val: any) => {
            const length = val ? String(val).length + 2 : 10;
            return Math.max(max, length);
        }, 12);
    });

    // Exportar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([ buffer ], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const fileName = `Inscripciones_${ new Date().toISOString().slice(0, 10) }.xlsx`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatDate(date: string | Date): string {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}
