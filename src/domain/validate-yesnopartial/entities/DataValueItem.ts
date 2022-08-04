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

export function geDataValueItemsGroupedByCocId(dataValue: DataValueItem): Id {
    return [dataValue.de_uid, dataValue.pe_startdate, dataValue.ou_name].join("-");
}
