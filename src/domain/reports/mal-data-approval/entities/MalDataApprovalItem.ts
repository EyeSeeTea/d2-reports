export interface MalDataApprovalItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    attribute: string | undefined;
    approvalWorkflowUid: string | undefined;
    approvalWorkflow: string | undefined;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: string | undefined;
    lastDateOfSubmission: string | undefined;
    lastDateOfApproval: string | undefined;
    modificationCount: string | undefined;
    notificationActive: boolean;
}

export interface MalDataApprovalItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
    workflow: string | undefined;
}

export interface Monitoring {
    orgUnit: string;
    period: string;
    monitoring: boolean;
}

export function getDataDuplicationItemId(dataSet: MalDataApprovalItem): string {
    return [dataSet.dataSetUid, dataSet.approvalWorkflowUid ?? "undefined", dataSet.period, dataSet.orgUnitUid].join("-");
}

export function parseDataDuplicationItemId(string: string): MalDataApprovalItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit] = string.split("-");
    if (!dataSet || !workflow || !period || !orgUnit) return undefined;

    return { dataSet, workflow, period, orgUnit };
}
