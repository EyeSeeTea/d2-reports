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
    comment?: string;
}

export interface DataValuesSelector {
    dataSetIds?: Id[];
    orgUnitIds?: Id[];
    periods?: string[];
    startDate?: string;
    endDate?: string;
}

export type DataValueToPost = Omit<
    DataValue & { dataSet?: string },
    "storedBy" | "created" | "lastUpdated" | "followup" | "deleted" | "attributeOptionCombo"
>;
