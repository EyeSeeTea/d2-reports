import { Id, Named } from "../../common/entities/Base";

export interface DataAttachmentItem {
    period: string;
    orgUnit: Named;
    dataSet: Named;
    link: string;
    lastUpdated: Date;
    storedBy: string;
}

export function getDataAttachmentsItemId(dataValue: DataAttachmentItem): Id {
    return [dataValue.dataSet, dataValue.period, dataValue.orgUnit.name].join("-");
}
