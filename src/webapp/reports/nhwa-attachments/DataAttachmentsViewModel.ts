import { Config } from "../../../domain/common/entities/Config";
import {
    DataAttachmentItem,
    getDataAttachmentsItemId,
} from "../../../domain/nhwa-attachments/entities/DataAttachmentItem";

export interface DataAttachmentsViewModel {
    id: string;
    period: string;
    orgUnit: string;
    dataSet: string;
    link: string;
    lastUpdated: string;
    storedBy: string;
}

export function getDataAttachmentsViews(config: Config, dataValues: DataAttachmentItem[]): DataAttachmentsViewModel[] {
    return dataValues.map(dataValue => {
        return {
            id: getDataAttachmentsItemId(dataValue),
            period: dataValue.period,
            orgUnit: dataValue.orgUnit.name,
            dataSet: dataValue.dataSet.name,
            link: dataValue.link || "",
            lastUpdated: dataValue.lastUpdated.toISOString(),
            storedBy: dataValue.storedBy,
        };
    });
}
