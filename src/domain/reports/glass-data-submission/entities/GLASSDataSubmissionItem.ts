import _ from "lodash";
import { Module, Status } from "../../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id, NamedRef } from "../../../common/entities/Base";
import { User } from "../../../common/entities/User";

export type DataSubmissionPeriod = "YEARLY" | "QUARTERLY";

export interface GLASSDataSubmissionItem {
    id: Id;
    module: Module;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    dataSubmissionPeriod: DataSubmissionPeriod;
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
    levelOfConfidentiality: "CONFIDENTIAL" | "NON-CONFIDENTIAL";
    status: Status;
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

export interface EARSubmissionItemIdentifier {
    orgUnit?: NamedRef;
    orgUnitId: string | undefined;
    orgUnitName: string | undefined;
    id: string;
    module: string | undefined;
    levelOfConfidentiality: string | undefined;
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
    questionnaires: ApprovalIds[];
    dashboards: {
        reportsMenu: string;
        validationReport: string;
    };
    dataSubmissionPeriod: DataSubmissionPeriod;
    userGroups: {
        captureAccess: NamedRef[];
        readAccess: NamedRef[];
        approveAccess: NamedRef[];
    };
}

export function getDataSubmissionItemId(submissionItem: GLASSDataSubmissionItem): string {
    return [submissionItem.orgUnit, submissionItem.period, submissionItem.module].join("-");
}

export function getEARSubmissionItemId(submissionItem: EARDataSubmissionItem): string {
    return [
        submissionItem.orgUnit.id,
        submissionItem.orgUnit.name,
        submissionItem.module,
        submissionItem.id,
        submissionItem.levelOfConfidentiality,
    ].join("-");
}

export function parseDataSubmissionItemId(string: string): GLASSDataSubmissionItemIdentifier | undefined {
    const [orgUnit, period, module] = string.split("-");
    if (!period) return undefined;

    return { module, period, orgUnit };
}

export function parseEARSubmissionItemId(string: string): EARSubmissionItemIdentifier | undefined {
    const [orgUnitId, orgUnitName, module, id, levelOfConfidentiality] = string.split("-");

    if (!id) return undefined;

    return { module, id, orgUnitId, orgUnitName, levelOfConfidentiality };
}

export function getUserModules(modules: GLASSDataSubmissionModule[], user: User): GLASSDataSubmissionModule[] {
    const userGroups = user.userGroups;
    const userGroupIds = userGroups.map(userGroup => userGroup.id);

    const userModules = modules.filter(module => {
        const moduleUserGroupIds = module.userGroups.approveAccess.map(userGroup => userGroup.id) ?? [];

        return _.some(moduleUserGroupIds, moduleUserGroupId => userGroupIds.includes(moduleUserGroupId));
    });

    return userModules;
}
