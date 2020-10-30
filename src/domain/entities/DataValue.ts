import { Id, NamedRef, Named } from "./Base";

export interface DataValue {
    period: string;
    orgUnit: Named;
    dataSet: Named;
    dataElement: NamedRef;
    categoryOptionCombo: Named;
    value: string;
    comment: string;
    lastUpdated: Date;
    storedBy: string;
}

export function getDataValueId(dataValue: DataValue): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.categoryOptionCombo].join("-");
}
