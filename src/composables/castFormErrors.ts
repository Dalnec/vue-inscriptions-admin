import toastEventBus from "primevue/toasteventbus";

export const castFormErrors = (errors: any) => {
    const errorMessages: string = Object?.["entries"](errors).map(([ field, message ]) => `${ field }: ${ message }`).join(", \n");
    toastEventBus.emit("add", {
        severity: "warn", summary: "Formulario requerido", detail: `Complete los siguientes campos:\n ${ errorMessages }`, life: 10000
    });
};
