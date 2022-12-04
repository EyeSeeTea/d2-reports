export interface MalDataSubscriptionItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    completed: boolean;
    validated: boolean;
}

export interface MalDataSubscriptionItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
    workflow: string;
}

export function getDataSubscriptionItemId(dataSet: MalDataSubscriptionItem): string {
    return [dataSet.dataSetUid, dataSet.period, dataSet.orgUnitUid].join("-");
}

export function parseDataSubscriptionItemId(string: string): MalDataSubscriptionItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit] = string.split("-");
    if (!dataSet || !workflow || !period || !orgUnit) return undefined;

    return { dataSet, workflow, period, orgUnit };
}
