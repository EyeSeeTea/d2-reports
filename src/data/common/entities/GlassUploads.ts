import { DataValue } from "@eyeseetea/d2-api/api/trackerEvents";
import { Maybe } from "../../../types/utils";

export const AMR_GLASS_PROE_UPLOADS_PROGRAM_ID = "yVFQpwmCX0D";

export const uploadsDHIS2Ids = {
    batchId: "dt3jH8M0dlX",
    countryCode: "ZUK2qYEqfhU",
    documentFileType: "iuKX7DEQmJs",
    documentId: "NAPcnttbh33",
    documentName: "EFVhW2HGCX0",
    specimens: "v9WVtKfMied",
    status: "hj79iVAy2QK",
    dataSubmissionId: "KUd8yXbyaoU",
    moduleId: "NKDNpVn5FJA",
    rows: "Br9BBTl7kOA",
    correspondingRisUploadId: "iUkQ1e94K0S",
    eventListDocumentId: "mRF7Eb7FZvR",
    calculatedEventListDocumentId: "jkQyTqUonDr",
    importSummaryId: "XEbwd14zCHJ",
    eventListDataDeleted: "oGt5jYsrCzp",
    calculatedEventListDataDeleted: "gSjqXdpjeAa",
    errorAsyncDeleting: "lIHM2QXWwUK",
    errorAsyncUploading: "O7EFyS16DBg",
    asyncImportSummariesId: "rV0d3FQC8Jp",
    period: "BXvUeQEf9bT",
} as const;

export function getValueById(dataValues: DataValue[], dataElement: string): Maybe<string> {
    return dataValues.find(dataValue => dataValue.dataElement === dataElement)?.value;
}

export function getBooleanValue(dataValues: DataValue[], dataElement: string): boolean {
    return getValueById(dataValues, dataElement) === "true";
}
