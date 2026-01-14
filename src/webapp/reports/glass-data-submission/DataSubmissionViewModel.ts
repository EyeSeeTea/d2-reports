import { Id } from "../../../domain/common/entities/Base";
import { Config } from "../../../domain/common/entities/Config";
import {
    EARDataSubmissionItem,
    GLASSDataSubmissionItem,
    Status,
    UploadStatus,
    getDataSubmissionItemId,
    getEARSubmissionItemId,
} from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";

export interface DataSubmissionViewModel {
    id: string;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
    module: string;
    questionnaireCompleted: boolean;
    dataSetsUploaded: string;
    submissionStatus: string;
}

export interface EARDataSubmissionViewModel {
    creationDate: string;
    id: string;
    module: Id;
    orgUnitId: string;
    orgUnitName: string;
    levelOfConfidentiality: "CONFIDENTIAL" | "NON-CONFIDENTIAL";
    submissionStatus: string;
    status: Status;
}

function getDatasetsUploadedFromStatus(uploadStatus: UploadStatus[]): string {
    const completed = uploadStatus.filter(s => s === "COMPLETED").length;
    const validated = uploadStatus.filter(s => s === "VALIDATED").length;
    const imported = uploadStatus.filter(s => s === "IMPORTED").length;
    const uploaded = uploadStatus.filter(s => s === "UPLOADED").length;

    const parts = [
        completed > 0 ? `${completed} completed` : null,
        validated > 0 ? `${validated} validated` : null,
        imported > 0 ? `${imported} imported` : null,
        uploaded > 0 ? `${uploaded} uploaded` : null,
    ].filter((x): x is string => x !== null);

    return parts.length ? parts.join(", ") : "No datasets";
}

export function getDataSubmissionViews(_config: Config, items: GLASSDataSubmissionItem[]): DataSubmissionViewModel[] {
    return items.map(item => {
        return {
            id: getDataSubmissionItemId(item),
            orgUnit: item.orgUnit,
            orgUnitName: item.orgUnitName,
            period: item.period,
            status: item.status,
            module: item.module,
            questionnaireCompleted: item.questionnaireCompleted,
            dataSetsUploaded: getDatasetsUploadedFromStatus(item.uploadStatuses),
            submissionStatus: item.submissionStatus,
            dataSubmissionPeriod: item.dataSubmissionPeriod,
        };
    });
}

export function getEARDataSubmissionViews(
    _config: Config,
    items: EARDataSubmissionItem[]
): EARDataSubmissionViewModel[] {
    return items.map(item => {
        return {
            id: getEARSubmissionItemId(item),
            orgUnitId: item.orgUnit.id,
            orgUnitName: item.orgUnit.name,
            creationDate: item.creationDate,
            status: item.status,
            submissionStatus: item.submissionStatus,
            levelOfConfidentiality: item.levelOfConfidentiality,
            module: item.module,
        };
    });
}
