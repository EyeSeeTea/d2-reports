import { DataValueItem } from "../../../domain/validate-yesnopartial/entities/DataValueItem";

export interface YesNoPartialViewModel {
    id: string;
    created: string;
    lastUpdated: string;
    ou_name: string;
    ou_uid: string;
    de_name: string;
    de_uid: string;
    yes: string;
    no: string;
    partial: string;
    pe_startdate: string;
    count: string;
    value: string;
    comment: string;
    storedBy: string;
}

export function getYesNoPartialViewModels(metadataObjects: DataValueItem[]): YesNoPartialViewModel[] {
    return metadataObjects.map(object => {
        return {
            id: object.de_uid + object.ou_uid + object.pe_startdate,
            value: object.value,
            ou_name: object.ou_name,
            ou_uid: object.ou_uid,
            de_name: object.de_name,
            de_uid: object.de_uid,
            yes: object.yes,
            no: object.no,
            partial: object.partial,
            pe_startdate: object.pe_startdate,
            created: object.created,
            lastUpdated: object.lastUpdated,
            comment: object.comment ?? "-",
            storedBy: object.storedBy ?? "-",
            count: object.count,
        };
    });
}
