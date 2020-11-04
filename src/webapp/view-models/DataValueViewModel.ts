import { DataValue, getDataValueId } from "../../domain/entities/DataValue";

export interface DataValueViewModel {
    id: string;
    period: string;
    orgUnit: string;
    dataSet: string;
    dataElementGroup: string;
    dataElement: string;
    categoryOptionCombo: string;
    value: string;
    comment: string;
    lastUpdated: string;
    storedBy: string;
}

export function getDataValueViews(dataValues: DataValue[]): DataValueViewModel[] {
    return dataValues.map(dataValue => {
        return {
            id: getDataValueId(dataValue),
            period: dataValue.period,
            orgUnit: dataValue.orgUnit.name,
            dataSet: dataValue.dataSet.name,
            dataElement: dataValue.dataElement.name,
            dataElementGroup: dataValue.dataElementGroup.name,
            categoryOptionCombo: dataValue.categoryOptionCombo.name,
            value: dataValue.value,
            comment: dataValue.comment || "",
            lastUpdated: dataValue.lastUpdated.toISOString(),
            storedBy: dataValue.storedBy,
        };
    });
}
