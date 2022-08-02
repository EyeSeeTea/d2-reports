import { Id, NamedRef, Named } from "../../common/entities/Base";

export interface DataAttachmentItem {
    period: string;
    orgUnit: Named;
    dataSet: Named;
    dataElement: NamedRef;
    link: string;
    lastUpdated: Date;
    storedBy: string;
}

export function getDataAttachmentsItemId(dataValue: DataAttachmentItem): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.orgUnit.name].join("-");
}
