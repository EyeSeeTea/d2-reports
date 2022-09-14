export interface DataDiffItem {
    datasetuid: string;
    orgunituid: string;
    period: string;
    value: string | undefined;
    apvdvalue: string | undefined;
    dataelement: string | undefined;
    apvddataelement: string | undefined;
    comment: string | undefined;
    apvdcomment: string | undefined;
}

export interface DataDiffItemIdentifier {
    dataSet: string;
    approval: string;
    orgUnit: string;
    period: string;
}

export function getDatiffItemId(dataSet: DataDiffItem): string {
    return [dataSet.datasetuid, dataSet.period, dataSet.orgunituid].join("-");
}

export function parseDataDiffItemId(string: string): DataDiffItemIdentifier | undefined {
    const [dataSet, approval, period, orgUnit] = string.split("-");
    if (!dataSet || !period || !approval || !orgUnit) return undefined;

    return { dataSet, period, orgUnit, approval };
}
