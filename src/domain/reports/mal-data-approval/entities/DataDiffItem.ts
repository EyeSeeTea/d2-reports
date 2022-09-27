export interface DataDiffItem {
    dataSetUid: string;
    orgUnitUid: string;
    period: string;
    value: string | undefined;
    apvdValue: string | undefined;
    dataElement: string | undefined;
    apvdDataElement: string | undefined;
    comment: string | undefined;
    apvdComment: string | undefined;
}

export interface DataDiffItemIdentifier {
    dataSet: string;
    approval: string;
    orgUnit: string;
    period: string;
}

export function getDataDiffItemId(dataSet: DataDiffItem): string {
    return [dataSet.dataSetUid, dataSet.period, dataSet.orgUnitUid].join("-");
}

export function parseDataDiffItemId(string: string): DataDiffItemIdentifier | undefined {
    const [dataSet, approval, period, orgUnit] = string.split("-");
    if (!dataSet || !period || !approval || !orgUnit) return undefined;

    return { dataSet, period, orgUnit, approval };
}
