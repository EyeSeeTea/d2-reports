import { Id } from "../../common/entities/Base";

export interface DataValueItem {
    ou_name: string;
    ou_uid: string;
    de_name: string;
    de_uid: string;
    coc_name: string;
    coc_uid: string;
    pe_startdate: string;
    value: string;
    comment: string;
    lastUpdated: string;
    created: string;
    storedBy: string;
    yes: string;
    no: string;
    partial: string;
    count: string;
}

export interface DataValueItemIdentifier {
    dataElement: string;
    orgUnit: string;
    period: string;
}
export function geDataValueItemsGroupedByCocId(dataValue: DataValueItem): Id {
    return [dataValue.de_uid, dataValue.ou_name, dataValue.pe_startdate].join("-");
}

export function parseDataValueItemId(string: string): DataValueItemIdentifier | undefined {
    const [dataElement, orgUnit, period] = string.split("-");
    if (!dataElement || !orgUnit || !period) return undefined;

    return { dataElement, orgUnit, period };
}
