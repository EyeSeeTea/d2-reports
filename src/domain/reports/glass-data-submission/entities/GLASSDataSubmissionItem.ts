import { Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";

export interface GLASSDataSubmissionItem {
    id: string;
    module: string;
    orgUnit: string;
    period: string;
    status: Status;
}

export interface GLASSDataSubmissionItemIdentifier {
    orgUnit: string | undefined;
    period: string;
    module: string | undefined;
}

export function getDataSubmissionItemId(submissionItem: GLASSDataSubmissionItem): string {
    return [submissionItem.orgUnit, submissionItem.period, submissionItem.module].join("-");
}

export function parseDataSubmissionItemId(string: string): GLASSDataSubmissionItemIdentifier | undefined {
    const [orgUnit, period, module] = string.split("-");
    if (!period) return undefined;

    return { module, period, orgUnit };
}
