export interface DataDuplicationItem {
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
