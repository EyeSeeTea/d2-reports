import { Id, NamedRef, Named } from "../../common/entities/Base";

export interface DataValueItem {
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

export function geDataValueItemsItemId(dataValue: DataValueItem): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.categoryOptionCombo, dataValue.orgUnit].join("-");
}

export function geDataValueItemsGroupedByCocId(dataValue: DataValueItem): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.orgUnit].join("-");
}
