import { Config } from "../../../domain/common/entities/Config";
import { DataCommentsItem, getDataCommentsItemId } from "../../../domain/nhwa-comments/entities/DataCommentsItem";

export interface DataCommentsViewModel {
    id: string;
    period: string;
    orgUnit: string;
    dataSet: string;
    section: string;
    dataElement: string;
    categoryOptionCombo: string;
    value: string;
    comment: string;
    lastUpdated: string;
    storedBy: string;
}

export function getDataCommentsViews(config: Config, dataValues: DataCommentsItem[]): DataCommentsViewModel[] {
    return dataValues.map(dataValue => {
        return {
            id: getDataCommentsItemId(dataValue),
            period: dataValue.period,
            orgUnit: dataValue.orgUnit.name,
            dataSet: dataValue.dataSet.name,
            dataElement: dataValue.dataElement.name,
            section: config.sections[dataValue.section]?.name || "-",
            categoryOptionCombo: dataValue.categoryOptionCombo.name,
            value: dataValue.value,
            comment: dataValue.comment || "",
            lastUpdated: dataValue.lastUpdated.toISOString(),
            storedBy: dataValue.storedBy,
        };
    });
}
