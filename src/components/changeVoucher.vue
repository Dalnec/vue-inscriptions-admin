<script setup lang="ts">
import { ref } from "vue";
import type { FileUploadSelectEvent } from "primevue";
import { type VoucherImageType } from "@/modules/registers/payEventView.vue";
import { fileToBase64 } from "@/composables/convertImageToUpload.ts";
import { Api } from "@/api/connection.ts";
import type { InscriptionsMembers } from "@/modules/inscriptions/inscriptionsMembers.ts";
import toastEvent from "@/composables/toastEvent.ts";

const props = defineProps<{ closeModal: () => void; refreshData: () => Promise<void>; formData: InscriptionsMembers }>();

const fileAccept = ref<string>("image/png, image/jpeg, image/jpg");
const fileValue = ref<VoucherImageType | null>(null);

const setValueFile = (event: FileUploadSelectEvent) => {
    fileValue.value = { file: event.files[0], objectURL: URL.createObjectURL(event.files[0]) };
};

function isVoucherImage(obj: unknown): obj is VoucherImageType {
    return (typeof obj === "object" && obj !== null && "file" in obj && obj.file instanceof File && "objectURL" in obj && typeof obj.objectURL === "string");
}

const updateVoucher = async(): Promise<void> => {
    let imageBase64 = "";
    if (isVoucherImage(fileValue.value)) imageBase64 = await fileToBase64(fileValue.value.file);

    if ( !fileValue.value || !fileValue.value?.file) {
        toastEvent({ severity: "error", summary: "Seleccione una imagen" });
        return;
    }

    const { response } = await Api.Patch({
        route: `inscription-groups/${ props.formData?.group.id }`,
        data: { voucherfile: imageBase64 }
    });

    if (response && response.status === 200) {
        toastEvent({ severity: "success", summary: "Voucher actualizado" });
        await props.refreshData();
        props.closeModal();
    }
};

</script>

<template>
    <div>
        <FileUpload name="voucher" :accept="fileAccept" :max-file-size="1000000" :file-limit="1" class="w-full"
                    ref="refVoucherImage" @select="(e: FileUploadSelectEvent) => setValueFile(e)" :show-upload-button="false"
                    :show-cancel-button="false" @remove="fileValue = null" input-id="voucherfile"
                    invalid-file-size-message="Peso de imagen invalido" invalid-file-limit-message="1 imagen máximo.">
        </FileUpload>
        <div class="mt-4 flex flex-wrap gap-2 md:flex-nowrap">
            <Button fluid severity="secondary" label="Cancelar" @click="props.closeModal()"/>
            <Button fluid label="Aceptar" @click="updateVoucher()"/>
        </div>
    </div>
</template>
