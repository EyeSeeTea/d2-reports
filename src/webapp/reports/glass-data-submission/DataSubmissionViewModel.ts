import { Config } from "../../../domain/common/entities/Config";
import {
    GLASSDataSubmissionItem,
    getDataSubmissionItemId,
} from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";

export interface DataSubmissionViewModel {
    id: string;
    module: string;
    orgUnit: string;
    period: string;
    status: Status;
    questionnaireCompleted: boolean;
    submissionStatus: string;
}

export type Status =
    | "NOT_COMPLETED"
    | "COMPLETE"
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
            period: item.period,
            module: item.module,
            status: item.status,
            questionnaireCompleted: item.questionnaireCompleted,
            submissionStatus: item.submissionStatus,
        };
    });
}
