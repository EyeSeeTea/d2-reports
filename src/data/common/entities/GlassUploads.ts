import { DataValue } from "@eyeseetea/d2-api/api/trackerEvents";
import { Id } from "../../../domain/common/entities/Base";
import { Maybe } from "../../../types/utils";

export const AMR_GLASS_PROE_UPLOADS_PROGRAM_ID = "yVFQpwmCX0D";

export const uploadsDHIS2Ids = {
    documentFileType: "iuKX7DEQmJs",
    documentId: "NAPcnttbh33",
    documentName: "EFVhW2HGCX0",
    status: "hj79iVAy2QK",
    dataSubmissionId: "KUd8yXbyaoU",
    moduleId: "NKDNpVn5FJA",
    period: "BXvUeQEf9bT",
} as const;

export type GlassUploadsStatus = "UPLOADED" | "IMPORTED" | "VALIDATED" | "COMPLETED" | "DELETED";
export const NOT_COMPLETED_STATUSES: GlassUploadsStatus[] = ["UPLOADED", "IMPORTED", "VALIDATED", "DELETED"];

export type GlassUploads = {
    id: Id;
    orgUnit: Id;
    fileType: string;
    fileId: Id;
    fileName: string;
    status: GlassUploadsStatus;
    module: Id;
    period: string;
};

export function getValueById(dataValues: DataValue[], dataElement: string): Maybe<string> {
    return dataValues.find(dataValue => dataValue.dataElement === dataElement)?.value;
}

export function getBooleanValue(dataValues: DataValue[], dataElement: string): boolean {
    return getValueById(dataValues, dataElement) === "true";
}
