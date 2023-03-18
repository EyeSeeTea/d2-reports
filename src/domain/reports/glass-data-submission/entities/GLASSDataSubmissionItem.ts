import { Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";

export interface GLASSDataSubmissionItem {
    id: string;
    module: string;
    orgUnit: string;
    period: number;
    status: Status;
}

export function getDataSubmissionItemId(submissionItem: GLASSDataSubmissionItem): string {
    return [submissionItem.orgUnit, submissionItem.period, submissionItem.module].join("-");
}
