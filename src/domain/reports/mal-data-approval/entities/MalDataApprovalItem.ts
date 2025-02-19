export interface MalDataApprovalItem {
    dataSetUid: string;
    dataSet: MalDataSet;
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
    monitoring: boolean;
}

export interface MalDataApprovalItemIdentifier {
    dataSet: string;
    orgUnit: string;
    orgUnitCode: string;
    period: string;
    workflow: string | undefined;
}

export type MalDataSet =
    | "MAL - WMR Form"
    | "MAL - Antimalarial drug policy"
    | "MAL - WMR National Policies"
    | "MAL - Malaria Free";

export function getDataDuplicationItemId(dataSet: MalDataApprovalItem): string {
    return [
        dataSet.dataSetUid,
        dataSet.approvalWorkflowUid,
        dataSet.period,
        dataSet.orgUnitUid,
        dataSet.orgUnitCode,
    ].join("-");
}

export function parseDataDuplicationItemId(string: string): MalDataApprovalItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit, orgUnitCode] = string.split("-");
    if (!dataSet || !period || !orgUnit || !orgUnitCode) return undefined;

    return { dataSet, workflow, period, orgUnit, orgUnitCode };
}
