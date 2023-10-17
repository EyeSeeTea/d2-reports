export interface DataApprovalItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    attribute: string;
    approvalWorkflowUid: string;
    approvalWorkflow: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: string;
}

export interface DataApprovalItemIdentifier {
    dataSet: string;
    orgUnit: string;
    dataSetName: string;
    orgUnitName: string;
    period: string;
    workflow: string;
}

export function getDataApprovalItemId(dataSet: DataApprovalItem): string {
    return [
        dataSet.dataSetUid,
        dataSet.approvalWorkflowUid,
        dataSet.period,
        dataSet.orgUnitUid,
        dataSet.dataSet,
        dataSet.orgUnit,
    ].join("-");
}

export function parseDataApprovalItemId(string: string): DataApprovalItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit, dataSetName, orgUnitName] = string.split("-");
    if (!dataSet || !workflow || !period || !orgUnit || !dataSetName || !orgUnitName) return undefined;

    return { dataSet, workflow, period, orgUnit, dataSetName, orgUnitName };
}
