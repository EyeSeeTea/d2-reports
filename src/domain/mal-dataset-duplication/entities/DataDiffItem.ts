export interface DataDiffItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    value: string | undefined;
    apvdvalue: string | undefined;
    dataelement: string | undefined;
    apvddataelement: string | undefined;
}

export interface DataDiffItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
}

export function getDatiffItemId(dataSet: DataDiffItem): string {
    return [dataSet.dataSetUid, dataSet.period, dataSet.orgUnitUid].join("-");
}

export function parseDataDiffItemId(string: string): DataDiffItemIdentifier | undefined {
    const [dataSet, orgUnit, period] = string.split("-");
    if (!dataSet || !period || !orgUnit) return undefined;

    return { dataSet, period, orgUnit };
}
