import { Config } from "../../../domain/common/entities/Config";
import {
    GLASSDataSubmissionItem,
    getDataSubmissionItemId,
} from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";

export interface DataSubmissionViewModel {
    id: string;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
    questionnaireCompleted: boolean;
    dataSetsUploaded: string;
    submissionStatus: string;
}

export type Module = "AMR" | "EGASP" | "AMRIndividual";

export type Status =
    | "NOT_COMPLETED"
    | "COMPLETE"
    | "UPDATE_REQUEST_ACCEPTED"
    | "PENDING_APPROVAL"
    | "REJECTED"
    | "APPROVED"
    | "ACCEPTED"
    | "PENDING_UPDATE_APPROVAL";

export function getDataSubmissionViews(_config: Config, items: GLASSDataSubmissionItem[]): DataSubmissionViewModel[] {
    return items.map(item => {
        return {
            id: getDataSubmissionItemId(item),
            orgUnit: item.orgUnit,
            orgUnitName: item.orgUnitName,
            period: item.period,
            status: item.status,
            questionnaireCompleted: item.questionnaireCompleted,
            dataSetsUploaded: item.dataSetsUploaded,
            submissionStatus: item.submissionStatus,
        };
    });
}
