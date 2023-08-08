import { Id } from "./Base";

export interface DataValue {
    dataElement: Id;
    period: string;
    orgUnit: Id;
    categoryOptionCombo: Id;
    attributeOptionCombo: Id;
    value: string;
    followup: boolean;
    deleted?: boolean;
}

export interface DataValuesSelector {
    dataSetIds?: Id[];
    orgUnitIds?: Id[];
    periods?: string[];
}

export type DataValueToPost = Omit<
    DataValue,
    "storedBy" | "created" | "lastUpdated" | "followup" | "deleted" | "attributeOptionCombo"
>;
