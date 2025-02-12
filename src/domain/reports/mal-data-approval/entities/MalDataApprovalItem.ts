import _ from "lodash";

export interface MalDataApprovalItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    orgUnitCode: string;
    period: string;
    attribute: string | undefined;
    approvalWorkflowUid: string | undefined;
    approvalWorkflow: string | undefined;
    completed: boolean;
    validated: boolean;
    approved?: boolean;
    lastUpdatedValue: string | undefined;
    lastDateOfSubmission: string | undefined;
    lastDateOfApproval: string | undefined;
    modificationCount: string | undefined;
    monitoring?: boolean | undefined;
}

export interface MalDataApprovalItemIdentifier {
    dataSet: string;
    orgUnit: string;
    orgUnitCode: string | undefined;
    period: string;
    workflow: string | undefined;
}

export interface Monitoring {
    orgUnit: string;
    period: string;
    monitoring?: boolean;
    enable?: boolean;
}

export type MonitoringValue = Record<string, Record<string, { monitoring: Monitoring[]; userGroups: string[] }[]>>;

export function getDataDuplicationItemId(dataSet: MalDataApprovalItem): string {
    return [
        dataSet.dataSetUid,
        dataSet.approvalWorkflowUid,
        dataSet.period,
        dataSet.orgUnitUid,
        dataSet.orgUnitCode,
    ].join("-");
}

export function getDataDuplicationItemMonitoringValue(
    dataSet: MalDataApprovalItem,
    dataSetName: string,
    monitoring: MonitoringValue
): boolean {
    const monitoringArray = _.first(monitoring["dataSets"]?.[dataSetName])?.monitoring;

    return !!_.find(monitoringArray, { orgUnit: dataSet.orgUnitCode, period: dataSet.period })?.enable;
}

export function parseDataDuplicationItemId(string: string): MalDataApprovalItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit, orgUnitCode] = string.split("-");
    if (!dataSet || !period || !orgUnit || !orgUnitCode) return undefined;

    return { dataSet, workflow, period, orgUnit, orgUnitCode };
}
