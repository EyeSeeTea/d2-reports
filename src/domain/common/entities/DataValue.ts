import { Id } from "./Base";
import { DataElementBoolean, DataElementNumber, DataElementText } from "./DataElement";

interface DataValueBase {
    orgUnitId: Id;
    period: Period;
    categoryOptionComboId: Id;
}

export interface DataValueBoolean extends DataValueBase {
    type: "BOOLEAN";
    isMultiple: false;
    dataElement: DataElementBoolean;
    value: boolean;
}

export interface DataValueNumberSingle extends DataValueBase {
    type: "NUMBER";
    isMultiple: false;
    dataElement: DataElementNumber;
    value: string;
}

export interface DataValueNumberMultiple extends DataValueBase {
    type: "NUMBER";
    isMultiple: true;
    dataElement: DataElementNumber;
    values: string[];
}

export interface DataValueTextSingle extends DataValueBase {
    type: "TEXT";
    isMultiple: false;
    dataElement: DataElementText;
    value: string;
}

export interface DataValueTextMultiple extends DataValueBase {
    type: "TEXT";
    isMultiple: true;
    dataElement: DataElementText;
    values: string[];
}

export type DataValue =
    | DataValueBoolean
    | DataValueNumberSingle
    | DataValueNumberMultiple
    | DataValueTextSingle
    | DataValueTextMultiple;

export type Period = string;

type DataValueSelector = string; // `${dataElementId.categoryOptionComboId}`
export type DataValueIndexed = Record<DataValueSelector, DataValue>;

export class DataValueM {
    static getSelector(options: { dataElementId: Id; categoryOptionComboId: Id }): DataValueSelector {
        return [options.dataElementId, options.categoryOptionComboId].join(".");
    }
}
