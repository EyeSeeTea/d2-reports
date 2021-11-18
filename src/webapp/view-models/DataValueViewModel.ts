import _ from "lodash";
import { Config } from "../../domain/entities/Config";
import { DataValue, getDataValueId } from "../../domain/entities/DataValue";

export interface DataValueViewModel {
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
    completed: boolean;
    validated: boolean;
}

export function getDataValueViews(config: Config, dataValues: DataValue[]): DataValueViewModel[] {
    return _(dataValues)
        .map(dataValue => {
            return {
                id: getDataValueId(dataValue),
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
                completed: Math.random() < 0.5,
                validated: Math.random() < 0.5,
            };
        })
        .uniqBy(({ dataSet, period, orgUnit }) => `${dataSet}-${period}-${orgUnit}`)
        .value();
}
