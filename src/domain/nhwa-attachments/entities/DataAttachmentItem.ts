import { Id, Named } from "../../common/entities/Base";

export interface DataAttachmentItem {
    id: string;
    period: string;
    orgUnit: Named;
    dataSet: Named;
    link: string;
    lastUpdated: Date;
    storedBy: string;
}

export function getDataAttachmentsItemId(dataValue: DataAttachmentItem): Id {
    return [dataValue.dataSet.name, dataValue.period, dataValue.orgUnit.name].join("-");
}
