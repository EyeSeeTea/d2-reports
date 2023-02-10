import { Maybe } from "../../../utils/ts-utils";
import { Id } from "./Base";

export interface DataValue {
    orgUnitId: Id;
    dataElementId: Id;
    period: Period;
    categoryOptionComboId: Id;
    value: Maybe<string>;
}

export type Period = string;
