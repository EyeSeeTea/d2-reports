export interface DataApprovalItem {
    dataSet: string;
    orgUnit: string;
    period: string;
    attribute: string;
    approvalWorkflow: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: string;
}

export function getDataApprovalItemId(dataSet: DataApprovalItem): string {
    return [dataSet.dataSet, dataSet.period, dataSet.orgUnit].join("-");
}
