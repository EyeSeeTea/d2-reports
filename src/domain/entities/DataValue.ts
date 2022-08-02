import { Id, NamedRef, Named } from "../common/entities/Base";

export interface DataValue {
    period: string;
    orgUnit: Named;
    dataSet: Named;
    dataElement: NamedRef;
    categoryOptionCombo: Named;
    comment: string;
    lastUpdated: Date;
    storedBy: string;
    value: string;
    yes:boolean,
    no:boolean,
    partial:boolean,
}

export function getDataValueId(dataValue: DataValue): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.categoryOptionCombo].join("-");
}