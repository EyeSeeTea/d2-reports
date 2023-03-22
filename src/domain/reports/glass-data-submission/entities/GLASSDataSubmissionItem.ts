import { Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id } from "../../../common/entities/Base";

export interface GLASSDataSubmissionItem {
    id: Id;
    module: string;
    orgUnit: string;
    period: string;
    status: Status;
    questionnaireCompleted: boolean;
}

export interface GLASSDataSubmissionItemIdentifier {
    orgUnit: string | undefined;
    period: string;
    module: string | undefined;
}

export interface GLASSDataSubmissionModule {
    id: Id;
    questionnaires: string;
    userGroups: string;
}

export function getDataSubmissionItemId(submissionItem: GLASSDataSubmissionItem): string {
    return [submissionItem.orgUnit, submissionItem.period, submissionItem.module].join("-");
}

export function parseDataSubmissionItemId(string: string): GLASSDataSubmissionItemIdentifier | undefined {
    const [orgUnit, period, module] = string.split("-");
    if (!period) return undefined;

    return { module, period, orgUnit };
}
