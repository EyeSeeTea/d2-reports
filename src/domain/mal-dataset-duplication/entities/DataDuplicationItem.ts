export interface DataDuplicationItem {
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
    duplicated: boolean;
    lastUpdatedValue: string;
    lastDateOfSubmission: string;
}

export interface DataDuplicationItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
    workflow: string;
}

export function getDataDuplicationItemId(dataSet: DataDuplicationItem): string {
    return [dataSet.dataSetUid, dataSet.approvalWorkflowUid, dataSet.period, dataSet.orgUnitUid].join("-");
}

export function parseDataDuplicationItemId(string: string): DataDuplicationItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit] = string.split("-");
    if (!dataSet || !workflow || !period || !orgUnit) return undefined;

    return { dataSet, workflow, period, orgUnit };
}
