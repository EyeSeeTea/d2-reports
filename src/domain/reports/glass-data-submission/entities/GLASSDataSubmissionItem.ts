import { Module, Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id, NamedRef } from "../../../common/entities/Base";

export interface GLASSDataSubmissionItem {
    id: Id;
    module: Module;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
    questionnaireCompleted: boolean;
    dataSetsUploaded: string;
    submissionStatus: string;
    from: Date | null;
    to: Date | null;
    statusHistory: {
        changedAt: string;
        from: Status;
        to: Status;
    }[];
    creationDate: string;
}

export interface EARDataSubmissionItem {
    creationDate: string;
    id: Id;
    module: Module;
    orgUnitId: string;
    orgUnitName: string;
    orgUnit: NamedRef;
    status: Status;
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

export interface EARSubmissionItemIdentifier {
    orgUnit?: NamedRef;
    orgUnitId: string | undefined;
    id: string;
    module: string | undefined;
}

export interface ApprovalIds {
    id: Id;
    approvedId: Id;
    programStageId: Id;
    programStageApprovedId: Id;
}

export interface GLASSDataSubmissionModule {
    id: Id;
    name: string;
    dataSets: ApprovalIds[];
    programs: ApprovalIds[];
    questionnaires: string;
    dashboards: {
        reportsMenu: string;
        validationReport: string;
    };
    userGroups: {
        captureAccess: NamedRef[];
        readAccess: NamedRef[];
        approveAccess: NamedRef[];
    };
}

export interface GLASSUserPermission {
    amrPermissions: NamedRef[];
    amrIndividualPermissions: NamedRef[];
    egaspPermissions: NamedRef[];
}

export function getDataSubmissionItemId(submissionItem: GLASSDataSubmissionItem): string {
    return [submissionItem.orgUnit, submissionItem.period, submissionItem.module].join("-");
}

export function getEARSubmissionItemId(submissionItem: EARDataSubmissionItem): string {
    return [submissionItem.orgUnit.id, submissionItem.module, submissionItem.id].join("-");
}

export function parseDataSubmissionItemId(string: string): GLASSDataSubmissionItemIdentifier | undefined {
    const [orgUnit, period, module] = string.split("-");
    if (!period) return undefined;

    return { module, period, orgUnit };
}

export function parseEARSubmissionItemId(string: string): EARSubmissionItemIdentifier | undefined {
    const [orgUnitId, module, id] = string.split("-");
    if (!id) return undefined;

    return { module, id, orgUnitId };
}
