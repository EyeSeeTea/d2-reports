import { Id } from "../../../domain/common/entities/Base";
import { MetadataObject } from "../../../domain/common/entities/MetadataObject";
import { DataValue } from "../../../domain/entities/DataValue";
import { DataValueItem } from "../../../domain/validate-yesnopartial/entities/DataValueItem";

export interface ValidateYesNoPartialnReportViewModel {
    created: string;
    lastUpdated: string;
    ou_name: string;
    ou_uid: string;
    de_name: string;
    de_uid: string;
    coc_name: string;
    coc_uid: string;
    pe_startdate: string;
    value: string;
    comment: string;
    storedBy: string;
}

export function getValidateYesNoPartialnReportViews(
    metadataObjects: DataValueItem[]
): ValidateYesNoPartialnReportViewModel[] {
    return metadataObjects.map(object => {
        return {
            value: object.value,
            created: object.created,
            lastUpdated: object.lastUpdated,
            ou_name: object.ou_name,
            ou_uid: object.ou_uid,
            de_name: object.de_name,
            de_uid: object.de_uid,
            coc_name: object.coc_name,
            coc_uid: object.coc_uid,
            pe_startdate: object.pe_startdate,
            comment: object.comment ?? "-",
            storedBy: object.storedBy ?? "-",
        };
    });
}
