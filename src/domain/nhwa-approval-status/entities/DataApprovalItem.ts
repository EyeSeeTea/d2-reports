export interface DataApprovalItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    attribute: string;
    approvalWorkflow: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: string;
}

export function getDataApprovalItemId(dataSet: DataApprovalItem): string {
    return [dataSet.dataSetUid, dataSet.period, dataSet.orgUnitUid].join("-");
}
