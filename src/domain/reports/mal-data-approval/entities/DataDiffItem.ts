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
    lastUpdated: string | undefined;
    lastUpdatedBy: string | undefined;
    lastSubmissionDate: string | undefined;
    lastSubmittedBy: string | undefined;
    categoryOption: string | undefined;
}

export interface DataDiffItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
    dataElement: string;
    value: string;
    comment?: string;
}

export function getDataDiffItemId(item: DataDiffItem): string {
    return [item.dataSetUid, item.period, item.orgUnitUid, item.dataElement, item.value, item.comment].join("|||");
}

export function parseDataDiffItemId(string: string): DataDiffItemIdentifier | undefined {
    const [dataSet, period, orgUnit, dataElement, value, comment] = string.split("|||");

    if (!dataSet || !period || !orgUnit || !dataElement || !value) return undefined;

    return { dataSet, period, orgUnit, dataElement, value, comment };
}
