import { Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id, NamedRef } from "../../../common/entities/Base";

export interface GLASSDataSubmissionItem {
    id: Id;
    module: string;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
    questionnaireCompleted: boolean;
    dataSetsUploaded: string;
    submissionStatus: string;
    statusHistory: {
        changedAt: string;
        from: Status;
        to: Status;
    }[];
}

export interface GLASSDataSubmissionItemIdentifier {
    orgUnit: string | undefined;
    period: string;
    module: string | undefined;
}

export interface GLASSDataSubmissionModule {
    id: Id;
    name: string;
    dataSets: { id: Id; approvedId: Id }[];
    questionnaires: string;
    userGroups: {
        captureAccess: NamedRef[];
        readAccess: NamedRef[];
    };
}

export function getDataSubmissionItemId(submissionItem: GLASSDataSubmissionItem): string {
    return [submissionItem.orgUnit, submissionItem.period, submissionItem.module].join("-");
}

export function parseDataSubmissionItemId(string: string): GLASSDataSubmissionItemIdentifier | undefined {
    const [orgUnit, period, module] = string.split("-");
    if (!period) return undefined;

    return { module, period, orgUnit };
}
