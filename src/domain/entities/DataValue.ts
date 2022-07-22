import { Id, NamedRef, Named } from "../common/entities/Base";

export interface DataValue {
    period: string;
    orgUnit: Named;
    dataSet: Named;
    dataElement: NamedRef;
    section: string;
    categoryOptionCombo: Named;
    value: string;
    comment: string;
    lastUpdated: Date;
    storedBy: string;
}

export function getDataValueId(dataValue: DataValue): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.categoryOptionCombo].join("-");
}
